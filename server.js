const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let registros = [
    { nombre: 'Erick Antonio Perez Tapia', carrera: 'Ing. Desarrollo y Gestion de Software' }
];

app.get('/', (req, res) => {
    const lista = registros.map(r => `<li><strong>${r.nombre}</strong> - ${r.carrera}</li>`).join('');
    res.send(`
        <h1>Sistema de Registro y Consulta (DevOps)</h1>
        <form method="POST" action="/registrar">
            <input name="nombre" placeholder="Nombre del alumno" required />
            <input name="carrera" placeholder="Carrera" required />
            <button type="submit">Registrar</button>
        </form>
        <h2>Alumnos Registrados:</h2>
        <ul>${lista}</ul>
    `);
});

app.post('/registrar', (req, res) => {
    registros.push({ nombre: req.body.nombre, carrera: req.body.carrera });
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));