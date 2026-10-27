import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import caminosRoutes from './routes/caminos.routes';
import objetosRoutes from './routes/objetos.routes';
import misionesRoutes from './routes/misiones.routes';
import iaRoutes from './routes/ia.routes';
import visitantesRoutes from './routes/visitantes.routes';
import adminsRoutes from './routes/admins.routes';


const app = express()
const PORT = process.env.PORT || 3000;

if (!process.env.GROQ_API_KEY?.trim()) {
    console.warn("GROQ_API_KEY no configurada. El evaluador usará el modo de respaldo.");
}


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'API FUNCIONANDO!'})
})

app.get('/api/ping', (req, res) => {
    res.json({ status: 'pong', timestamp: new Date().toISOString() })
})

app.use('/api/caminos', caminosRoutes);
app.use('/api/objetos', objetosRoutes);
app.use('/api/misiones', misionesRoutes);
app.use('/api/ia', iaRoutes);
app.use('/api/visitantes', visitantesRoutes);
app.use('/api/admin', adminsRoutes);


app.listen(PORT, ()=> {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
})