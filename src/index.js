import express from 'express';
import bodyParser from 'body-parser';
import { getPool } from './db.js';
import 'dotenv/config';

const app = express();
const PORT = Number(process.env.PORT || 80);
app.use(bodyParser.urlencoded({ extended: false }));

const pool = await getPool();

const render = (rows) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Student Records</title>
<style>
  :root{
    --bg: #0b1020;
    --card: #12182b;
    --muted: #94a3b8;
    --text: #e2e8f0;
    --primary: #6366f1;
    --primary-2: #5357db;
    --accent: #22d3ee;
    --border: #22304d;
    --danger: #ef4444;
    --success: #10b981;
    --shadow: 0 8px 30px rgba(0,0,0,.25);
    --radius: 14px;
  }
  @media (prefers-color-scheme: light){
    :root{
      --bg:#f5f7fb; --card:#ffffff; --text:#0f172a; --muted:#64748b;
      --border:#e5e7eb; --shadow:0 10px 30px rgba(2,6,23,.07)
    }
  }
  *{box-sizing:border-box}
  html,body{height:100%}
  body{
    margin:0; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    color:var(--text); background: radial-gradient(1200px 600px at 20% -10%, rgba(34,211,238,.18), transparent 60%),
                       radial-gradient(900px 600px at 100% 10%, rgba(99,102,241,.18), transparent 60%),
                       var(--bg);
  }

  /* Top bar */
  .nav{
    position:sticky; top:0; z-index:10;
    backdrop-filter:saturate(180%) blur(10px);
    background:linear-gradient(0deg, rgba(0,0,0,.05), rgba(0,0,0,.05));
    border-bottom:1px solid var(--border);
  }
  .nav-wrap{
    max-width:1100px; margin:0 auto; padding:14px 20px;
    display:flex; align-items:center; justify-content:space-between;
  }
  .brand{display:flex; gap:10px; align-items:center}
  .dot{width:10px; height:10px; border-radius:999px; background:var(--accent); box-shadow:0 0 15px var(--accent)}
  .title{font-weight:800; letter-spacing:.3px}

  /* Page */
  .page{max-width:1100px; margin:32px auto; padding:0 20px}
  .grid{display:grid; grid-template-columns:1fr; gap:18px}
  @media(min-width:920px){ .grid{grid-template-columns:360px 1fr} }

  /* Card */
  .card{
    background:var(--card); border:1px solid var(--border);
    border-radius:var(--radius); box-shadow:var(--shadow);
  }
  .card .hdr{padding:18px 18px 0}
  .card .body{padding:18px}
  .muted{color:var(--muted); font-size:14px}

  /* Form */
  form.inline{display:flex; gap:10px; flex-wrap:wrap}
  .field{
    display:flex; flex-direction:column; gap:6px; min-width:120px; flex:1;
  }
  label{font-size:13px; color:var(--muted)}
  input[type="text"], input[type="number"]{
    width:100%; padding:12px 12px; border-radius:12px; border:1px solid var(--border);
    background:transparent; color:var(--text); outline:none;
    transition: box-shadow .15s ease, border-color .15s ease, transform .05s ease;
  }
  input:focus{
    border-color: color-mix(in oklab, var(--primary) 65%, #fff);
    box-shadow: 0 0 0 6px color-mix(in oklab, var(--primary) 16%, transparent);
  }

  .actions{display:flex; align-items:center; gap:10px}
  button{
    appearance:none; border:0; border-radius:12px; padding:12px 14px; font-weight:600; cursor:pointer;
    transition: transform .05s ease, box-shadow .2s ease, background .2s ease, opacity .2s ease;
  }
  .btn{
    background:linear-gradient(180deg, color-mix(in oklab, var(--primary) 92%, #fff), var(--primary-2));
    color:white; box-shadow:0 10px 20px rgba(99,102,241,.28);
  }
  .btn:hover{ transform:translateY(-1px) }
  .btn:active{ transform:translateY(0px) scale(.99) }
  .btn-outline{
    background:transparent; border:1px solid var(--border); color:var(--text)
  }
  .btn-danger{
    background: linear-gradient(180deg, #f87171, #ef4444); color:white;
    box-shadow:0 10px 20px rgba(239,68,68,.25)
  }

  /* Table */
  .table-wrap{overflow:auto; border-top:1px dashed var(--border)}
  table{width:100%; border-collapse:separate; border-spacing:0}
  thead th{
    text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:.08em;
    color:var(--muted); padding:14px 14px;
    position:sticky; top:0; background:linear-gradient(0deg, rgba(0,0,0,.04), rgba(0,0,0,.04));
    border-bottom:1px solid var(--border);
  }
  tbody td{padding:14px; border-bottom:1px dashed var(--border)}
  tbody tr:hover{background:linear-gradient(0deg, rgba(34,211,238,.06), transparent)}
  .td-actions{white-space:nowrap; text-align:right}
  .chip{
    display:inline-block; padding:6px 10px; border-radius:999px;
    background:rgba(34,211,238,.12); color:var(--text); border:1px solid color-mix(in oklab, var(--accent) 40%, var(--border));
    font-size:12px
  }

  .footer{
    padding:22px 0; color:var(--muted); font-size:12px; text-align:center
  }

  /* Tiny helper for visually-hidden labels on inline buttons */
  .visually-hidden{position:absolute; width:1px; height:1px; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; padding:0}
</style>
<script>
  // Ask for confirmation on delete
  function confirmDelete(form){
    if(confirm('Delete this student?')) { form.submit(); }
    return false;
  }
</script>
</head>
<body>

  <nav class="nav">
    <div class="nav-wrap">
      <div class="brand">
        <span class="dot"></span>
        <span class="title">Student Records</span>
      </div>
      <span class="muted">POC · AWS EC2 + MySQL</span>
    </div>
  </nav>

  <main class="page grid">
    <!-- Left: Create / Import -->
    <section class="card">
      <div class="hdr">
        <h2 style="margin:0 0 6px">Add New Student</h2>
        <p class="muted" style="margin:0 0 12px">Create a new record quickly. All fields required.</p>
      </div>
      <div class="body">
        <form class="inline" method="post" action="/add">
          <div class="field">
            <label for="name">Name</label>
            <input id="name" name="name" placeholder="Jane Doe" required>
          </div>
          <div class="field" style="max-width:150px">
            <label for="age">Age</label>
            <input id="age" name="age" type="number" placeholder="21" required>
          </div>
          <div class="field">
            <label for="major">Major</label>
            <input id="major" name="major" placeholder="Computer Science" required>
          </div>
          <div class="actions">
            <button class="btn" type="submit">Add Student</button>
            <button class="btn-outline" type="reset">Clear</button>
          </div>
        </form>
      </div>
    </section>

    <!-- Right: Table -->
    <section class="card" style="overflow:hidden">
      <div class="hdr">
        <h2 style="margin:0 0 6px">All Students</h2>
        <p class="muted" style="margin:0 0 12px">Manage, edit or remove records below.</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:80px">ID</th>
              <th>Name</th>
              <th style="width:100px">Age</th>
              <th>Major</th>
              <th class="td-actions" style="width:180px">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td><span class="chip">#${r.id}</span></td>
                <td>${r.name}</td>
                <td>${r.age}</td>
                <td>${r.major}</td>
                <td class="td-actions">
                  <form style="display:inline" method="post" action="/delete" onsubmit="return confirmDelete(this)">
                    <input type="hidden" name="id" value="${r.id}">
                    <button class="btn-danger" type="submit" title="Delete">
                      Delete
                      <span class="visually-hidden">student ${r.id}</span>
                    </button>
                  </form>
                  <form style="display:inline-block; margin-left:8px" method="post" action="/update">
                    <input type="hidden" name="id" value="${r.id}">
                    <input name="name" value="${r.name}" required
                           style="width:160px; margin-right:6px; padding:8px 10px; border-radius:10px; border:1px solid var(--border); background:transparent; color:var(--text)">
                    <input name="age" type="number" value="${r.age}" required
                           style="width:80px; margin-right:6px; padding:8px 10px; border-radius:10px; border:1px solid var(--border); background:transparent; color:var(--text)">
                    <input name="major" value="${r.major}" required
                           style="width:180px; margin-right:6px; padding:8px 10px; border-radius:10px; border:1px solid var(--border); background:transparent; color:var(--text)">
                    <button class="btn" type="submit">Update</button>
                  </form>
                </td>
              </tr>
            `).join('')}
            ${rows.length === 0 ? `
              <tr><td colspan="5" style="text-align:center; padding:26px; color:var(--muted)">No records yet — add one on the left.</td></tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    </section>
  </main>

  <div class="footer">© ${new Date().getFullYear()} Student Records · Built for BMIT3273</div>
</body>
</html>`;

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