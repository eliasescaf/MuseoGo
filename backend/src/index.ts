import cors from 'cors';
import express from 'express';
import caminosRoutes from './routes/caminos.routes';
import objetosRoutes from './routes/objetos.routes';
import misionesRoutes from './routes/misiones.routes';

const app = express()
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'API FUNCIONANDO!'})
})

app.use('/api/caminos', caminosRoutes);
app.use('/api/objetos', objetosRoutes);
app.use('/api/misiones', misionesRoutes);

app.listen(PORT, ()=> {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
})