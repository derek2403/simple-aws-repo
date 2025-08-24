import express from 'express';
import bodyParser from 'body-parser';
import { getPool } from './db.js';
import 'dotenv/config';

const app = express();
const PORT = Number(process.env.PORT || 80);
app.use(bodyParser.urlencoded({ extended: false }));

const pool = await getPool();

const render = (rows) => `<!doctype html>
<html><head><meta charset="utf-8"><title>Student Records</title>
<style>body{font-family:system-ui,Arial;margin:2rem}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:.4rem}</style>
</head><body>
<h1>Student Records</h1>
<form method="post" action="/add">
  <input name="name" placeholder="Name" required>
  <input name="age" type="number" placeholder="Age" required>
  <input name="major" placeholder="Major" required>
  <button type="submit">Add</button>
</form>
<table><thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Major</th><th>Actions</th></tr></thead>
<tbody>
${rows.map(r=>`<tr>
<td>${r.id}</td><td>${r.name}</td><td>${r.age}</td><td>${r.major}</td>
<td>
<form style="display:inline" method="post" action="/delete"><input type="hidden" name="id" value="${r.id}"><button>Delete</button></form>
<form style="display:inline" method="post" action="/update">
  <input type="hidden" name="id" value="${r.id}">
  <input name="name" value="${r.name}" required>
  <input name="age" type="number" value="${r.age}" required>
  <input name="major" value="${r.major}" required>
  <button>Update</button>
</form>
</td>
</tr>`).join('')}
</tbody></table>
</body></html>`;

app.get('/', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM students ORDER BY id DESC');
  res.send(render(rows));
});
app.post('/add', async (req, res) => {
  const { name, age, major } = req.body;
  await pool.query('INSERT INTO students(name, age, major) VALUES(?,?,?)', [name, age, major]);
  res.redirect('/');
});
app.post('/delete', async (req, res) => {
  await pool.query('DELETE FROM students WHERE id=?', [req.body.id]);
  res.redirect('/');
});
app.post('/update', async (req, res) => {
  const { id, name, age, major } = req.body;
  await pool.query('UPDATE students SET name=?, age=?, major=? WHERE id=?', [name, age, major, id]);
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Student app listening on ${PORT}`));