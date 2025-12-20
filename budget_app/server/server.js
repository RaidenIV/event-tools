const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// MongoDB connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/budgets';

async function connectDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db();
  console.log('✅ Connected to MongoDB');
}

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Budget App Server is running',
    storage: 'MongoDB'
  });
});

// GET all budgets
app.get('/api/budgets', async (req, res) => {
  try {
    const budgets = await db.collection('budgets')
      .find({}, { projection: { csv: 0 } })
      .toArray();
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// GET specific budget
app.get('/api/budgets/:id', async (req, res) => {
  try {
    const budget = await db.collection('budgets').findOne({ id: req.params.id });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.type('text/csv').send(budget.csv);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(404).json({ error: 'Budget not found' });
  }
});

// POST new budget
app.post('/api/budgets', async (req, res) => {
  try {
    const { csv, name, date } = req.body;
    
    if (!csv || !name || !date) {
      return res.status(400).json({ error: 'Missing required fields: csv, name, date' });
    }
    
    const id = Date.now().toString();
    const budget = {
      id,
      name,
      date,
      csv,
      createdAt: new Date().toISOString()
    };
    
    await db.collection('budgets').insertOne(budget);
    
    console.log(`Budget saved: ${name} (${id})`);
    res.json({ id, message: 'Budget saved successfully' });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

// DELETE budget
app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const result = await db.collection('budgets').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    console.log(`Budget deleted: ${req.params.id}`);
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

const PORT = process.env.PORT || 3000;

// Start server after DB connection
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🗄️  Using MongoDB for storage`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
