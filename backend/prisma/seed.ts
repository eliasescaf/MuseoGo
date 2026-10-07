import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log("Iniciando carga de datos");

    const adminExiste = await prisma.administrador.findUnique({
        where: {email: "admin@museo.com"}
    });

    if(!adminExiste){
        const saltosRound = 10;
        const hashedPassword = await bcrypt.hash('admin', saltosRound);

        await prisma.administrador.create({
            data: {
                nombre: 'admin',
                email: 'admin@museo.com',
                password: hashedPassword
            }
        });
        console.log("Administrador creado");
    }else {
        console.log("Ya existe este admninistrador");
    }
}

main()
    .catch((e) => {
        console.error("Error en el seed: ", e);
        process.exit(1);
    })
    .finally( async () => {
        await prisma.$disconnect();
    })