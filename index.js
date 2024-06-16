import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Read products from JSON file
const getProducts = () => {
  const data = fs.readFileSync(path.join(__dirname, 'products.json'));
  return JSON.parse(data);
};

// Serve the products.json file
app.get('/products.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'products.json'));
});

app.get('/', (req, res) => {
  const products = getProducts();
  res.render('overview', { products });
});

app.get('/product/:id', (req, res) => {
  const products = getProducts();
  const product = products.find(p => p.id === parseInt(req.params.id, 10));
  if (product) {
    res.render('product', { product });
  } else {
    res.status(404).send('Product not found');
  }
});

app.get('/product-add', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'add-product.html'));
});

app.post('/submit-product', (req, res) => {
  const { productName, image, from, nutrients, quantity, price, description, organic } = req.body;

  const newProduct = {
    id: Date.now(), // Generate a unique ID
    productName,
    image,
    from,
    nutrients,
    quantity,
    price,
    description,
    organic: !!organic
  };

  const products = getProducts();
  products.push(newProduct);

  fs.writeFileSync(path.join(__dirname, 'products.json'), JSON.stringify(products, null, 2));
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Listening to requests on port ${PORT}`);
});
