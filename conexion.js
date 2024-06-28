const mysql = require('mysql');
const express = require('express');
const app = express();
const port = 3000;

// Configurar Pug como motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

// Configuración de Express.js para servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// Middleware para procesar datos enviados en formularios
app.use(express.urlencoded({ extended: true }));

// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'laboratorio15'
});

// Conexión a la base de datos
connection.connect((error) => {
    if (error) {
        console.error('Error al conectar a MySQL: ', error);
        return;
    }
    console.log('Conexión exitosa a MySQL');
});

// Ruta principal para listar alumnos y cursos
app.get('/', (req, res) => {
    const queryAlumnos = `
        SELECT alumnos.id, alumnos.columna1, alumnos.columna2, alumnos.columna3, alumnos.curso_id, cursos.nombre as curso 
        FROM alumnos 
        LEFT JOIN cursos ON alumnos.curso_id = cursos.id;
    `;
    const queryCursos = 'SELECT * FROM cursos';

    // Ejecutar ambas consultas en paralelo
    connection.query(queryAlumnos, (errorAlumnos, resultadosAlumnos) => {
        if (errorAlumnos) {
            console.error('Error al obtener los datos de alumnos: ', errorAlumnos);
            res.status(500).send('Error al obtener los datos de alumnos');
            return;
        }
        connection.query(queryCursos, (errorCursos, resultadosCursos) => {
            if (errorCursos) {
                console.error('Error al obtener los datos de cursos: ', errorCursos);
                res.status(500).send('Error al obtener los datos de cursos');
                return;
            }
            res.render('index', { alumnos: resultadosAlumnos, cursos: resultadosCursos });
        });
    });
});

// Rutas para agregar, actualizar y eliminar alumnos y cursos (sin cambios)

app.post('/agregar-alumno', (req, res) => {
    const { columna1, columna2, columna3, curso_id } = req.body;
    const consulta = 'INSERT INTO alumnos (columna1, columna2, columna3, curso_id) VALUES (?, ?, ?, ?)';
    connection.query(consulta, [columna1, columna2, columna3, curso_id], (error, results) => {
        if (error) {
            console.error('Error al insertar datos: ', error);
            return;
        }
        res.redirect('/');
    });
});

app.post('/actualizar-alumno/:id', (req, res) => {
    const { id } = req.params;
    const { columna1, columna2, columna3, curso_id } = req.body;

    // Validar valores
    const columna2Value = columna2 ? parseInt(columna2, 10) : null;
    const cursoIdValue = curso_id ? parseInt(curso_id, 10) : null;

    const consulta = 'UPDATE alumnos SET columna1 = ?, columna2 = ?, columna3 = ?, curso_id = ? WHERE id = ?';
    connection.query(consulta, [columna1, columna2Value, columna3, cursoIdValue, id], (error, results) => {
        if (error) {
            console.error('Error al actualizar datos: ', error);
            return;
        }
        res.redirect('/');
    });
});

app.post('/eliminar-alumno/:id', (req, res) => {
    const { id } = req.params;
    const consulta = 'DELETE FROM alumnos WHERE id = ?';
    connection.query(consulta, [id], (error, results) => {
        if (error) {
            console.error('Error al eliminar datos: ', error);
            return;
        }
        res.redirect('/');
    });
});

app.post('/agregar-curso', (req, res) => {
    const { nombre, descripcion } = req.body;
    const consulta = 'INSERT INTO cursos (nombre, descripcion) VALUES (?, ?)';
    connection.query(consulta, [nombre, descripcion], (error, results) => {
        if (error) {
            console.error('Error al insertar datos: ', error);
            return;
        }
        res.redirect('/');
    });
});

app.get('/alumnos-por-curso/:curso_id', (req, res) => {
    const { curso_id } = req.params;
    const query = `
        SELECT alumnos.id, alumnos.columna1, alumnos.columna2, alumnos.columna3, cursos.nombre as curso 
        FROM alumnos 
        LEFT JOIN cursos ON alumnos.curso_id = cursos.id
        WHERE alumnos.curso_id = ?;
    `;
    connection.query(query, [curso_id], (error, resultados) => {
        if (error) {
            console.error('Error al obtener los datos: ', error);
            res.status(500).send('Error al obtener los datos');
            return;
        }
        res.render('alumnos-por-curso', { datos: resultados });
    });
});

// Iniciar el servidor 
app.listen(port, () => { 
    console.log(`Servidor en ejecución en http://localhost:${port}`);
});
