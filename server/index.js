const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/template-manager';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB client
let db;
MongoClient.connect(MONGODB_URI)
  .then(async client => {
    console.log('Connected to MongoDB');
    db = client.db();
    
    // Initialize database with default admin user if no users exist
    await initializeDatabase();
  })
  .catch(error => console.error('MongoDB connection error:', error));

// Initialize database with default data
async function initializeDatabase() {
  try {
    // Check if any users exist
    const userCount = await db.collection('users').countDocuments();
    
    if (userCount === 0) {
      console.log('No users found. Creating default admin user...');
      
      // Create default admin user
      const adminPassword = await bcrypt.hash('admin123', 12);
      const adminUser = {
        name: 'Admin User',
        email: 'admin@templatemanager.com',
        password: adminPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin@templatemanager.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        preferences: {
          theme: 'light',
          emailNotifications: true,
          marketingEmails: false,
        },
      };
      
      await db.collection('users').insertOne(adminUser);
      console.log('Default admin user created successfully');
    }
    
    // Check if any categories exist
    const categoryCount = await db.collection('categories').countDocuments();
    
    if (categoryCount === 0) {
      console.log('No categories found. Creating default categories...');
      
      const defaultCategories = [
        {
          name: 'UI Design',
          slug: 'ui-design',
          description: 'User interface design templates',
          color: '#3B82F6',
          createdAt: new Date(),
        },
        {
          name: 'UX Design',
          slug: 'ux-design',
          description: 'User experience design templates',
          color: '#10B981',
          createdAt: new Date(),
        },
        {
          name: 'System Design',
          slug: 'system-design',
          description: 'System architecture design templates',
          color: '#F59E0B',
          createdAt: new Date(),
        },
        {
          name: 'Architecture',
          slug: 'architecture',
          description: 'Software architecture templates',
          color: '#EF4444',
          createdAt: new Date(),
        },
      ];
      
      await db.collection('categories').insertMany(defaultCategories);
      console.log('Default categories created successfully');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password: password ? '***' : 'missing' });
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    });
    
    console.log('User found:', user ? 'yes' : 'no');
    console.log('User email:', user?.email);
    console.log('User active:', user?.isActive);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password
    console.log('Checking password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } }
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id.toString(),
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const authUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };

    res.json({ user: authUser, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'read-write',
      isActive: true,
      emailVerified: false,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      preferences: {
        theme: 'light',
        emailNotifications: true,
        marketingEmails: false,
      },
    };

    const result = await db.collection('users').insertOne(newUser);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.insertedId.toString(),
        email: newUser.email,
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const authUser = {
      id: result.insertedId.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatarUrl: newUser.avatarUrl,
    };

    res.status(201).json({ user: authUser, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Auth verification route
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(req.user.id) 
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const authUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };

    res.json({ user: authUser });
  } catch (error) {
    console.error('Auth verify error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Template routes
app.get('/api/templates', async (req, res) => {
  try {
    const { category, search, authorId, isPublic } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (authorId) {
      filter.authorId = authorId;
    }
    if (isPublic !== undefined) {
      filter.isPublic = isPublic === 'true';
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const templates = await db.collection('templates')
      .find(filter)
      .sort({ updatedAt: -1 })
      .toArray();

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/templates', authenticateToken, async (req, res) => {
  try {
    const template = {
      ...req.body,
      authorId: req.user.id,
      viewCount: 0,
      starCount: 0,
      bookmarkCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('templates').insertOne(template);
    const newTemplate = await db.collection('templates').findOne({ _id: result.insertedId });
    
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/templates/:id', async (req, res) => {
  try {
    const template = await db.collection('templates').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/templates/:id', authenticateToken, async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date(),
    };

    const result = await db.collection('templates').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(result.value);
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/templates/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.collection('templates').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/templates/:id/view', async (req, res) => {
  try {
    await db.collection('templates').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { viewCount: 1 } }
    );

    res.json({ message: 'View count updated' });
  } catch (error) {
    console.error('Update view count error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User routes
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Category routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.collection('categories').find().toArray();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
  try {
    const category = {
      ...req.body,
      createdAt: new Date(),
    };

    const result = await db.collection('categories').insertOne(category);
    const newCategory = await db.collection('categories').findOne({ _id: result.insertedId });
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const category = await db.collection('categories').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.collection('categories').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(result.value);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.collection('categories').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User Action routes
app.post('/api/user-actions', authenticateToken, async (req, res) => {
  try {
    const action = {
      ...req.body,
      createdAt: new Date(),
    };

    const result = await db.collection('user_actions').insertOne(action);
    const newAction = await db.collection('user_actions').findOne({ _id: result.insertedId });
    
    res.status(201).json(newAction);
  } catch (error) {
    console.error('Create user action error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/user-actions/user/:userId/target/:targetId/type/:actionType', async (req, res) => {
  try {
    const { userId, targetId, actionType } = req.params;
    
    const action = await db.collection('user_actions').findOne({
      userId,
      targetId,
      actionType,
    });
    
    if (!action) {
      return res.status(404).json({ message: 'Action not found' });
    }

    res.json(action);
  } catch (error) {
    console.error('Get user action error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/user-actions/user/:userId/target/:targetId/type/:actionType', authenticateToken, async (req, res) => {
  try {
    const { userId, targetId, actionType } = req.params;
    
    const result = await db.collection('user_actions').deleteOne({
      userId,
      targetId,
      actionType,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Action not found' });
    }

    res.json({ message: 'Action deleted successfully' });
  } catch (error) {
    console.error('Delete user action error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/user-actions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { actionType } = req.query;
    
    const filter = { userId };
    if (actionType) {
      filter.actionType = actionType;
    }

    const actions = await db.collection('user_actions').find(filter).toArray();
    res.json(actions);
  } catch (error) {
    console.error('Get user actions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/user-actions/target/:targetId/type/:actionType/count', async (req, res) => {
  try {
    const { targetId, actionType } = req.params;
    
    const count = await db.collection('user_actions').countDocuments({
      targetId,
      actionType,
    });

    res.json({ count });
  } catch (error) {
    console.error('Get action count error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Comment routes
app.post('/api/comments', authenticateToken, async (req, res) => {
  try {
    const comment = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('comments').insertOne(comment);
    const newComment = await db.collection('comments').findOne({ _id: result.insertedId });
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/comments/template/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const comments = await db.collection('comments')
      .find({ templateId })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date(),
    };

    const result = await db.collection('comments').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json(result.value);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.collection('comments').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Password Reset Token routes
app.post('/api/password-reset-tokens', async (req, res) => {
  try {
    const token = {
      ...req.body,
      createdAt: new Date(),
    };

    const result = await db.collection('password_reset_tokens').insertOne(token);
    const newToken = await db.collection('password_reset_tokens').findOne({ _id: result.insertedId });
    
    res.status(201).json(newToken);
  } catch (error) {
    console.error('Create password reset token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/password-reset-tokens/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const resetToken = await db.collection('password_reset_tokens').findOne({ token });
    
    if (!resetToken) {
      return res.status(404).json({ message: 'Token not found' });
    }

    res.json(resetToken);
  } catch (error) {
    console.error('Get password reset token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/password-reset-tokens/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const result = await db.collection('password_reset_tokens').deleteOne({ token });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Token not found' });
    }

    res.json({ message: 'Token deleted successfully' });
  } catch (error) {
    console.error('Delete password reset token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/password-reset-tokens/expired', async (req, res) => {
  try {
    const now = new Date();
    
    const result = await db.collection('password_reset_tokens').deleteMany({
      expiresAt: { $lt: now }
    });

    res.json({ message: `Deleted ${result.deletedCount} expired tokens` });
  } catch (error) {
    console.error('Delete expired tokens error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Additional user routes
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/users/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await db.collection('users').findOne({ 
      email: decodeURIComponent(email).toLowerCase() 
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by email error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    const user = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(user);
    const newUser = await db.collection('users').findOne({ _id: result.insertedId });
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date(),
    };

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.value);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Password reset routes
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await db.collection('password_reset_tokens').insertOne({
      email: user.email,
      token,
      expiresAt,
      createdAt: new Date(),
    });

    res.json({ token, message: 'Password reset token generated' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const resetToken = await db.collection('password_reset_tokens').findOne({ token });
    
    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({ message: 'Token expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await db.collection('users').updateOne(
      { email: resetToken.email },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    // Delete the reset token
    await db.collection('password_reset_tokens').deleteOne({ token });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
