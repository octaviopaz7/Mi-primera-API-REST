import express, { json } from "express";
import fs, { read } from "fs";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());


/* Base de datos*/
const readData = () => {
  try {
    const data = fs.readFileSync("./db.json");
    return JSON.parse(data);
  } catch (error) {
    console.log(error);
  }
}

const writeData = (data) => {
  try {
    data.usuarios.sort((a, b) => a.id - b.id); // Ordenar los usuarios por ID antes de escribir en el archivo

    fs.writeFileSync("./db.json", JSON.stringify(data));
  } catch (error) {
    console.log(error);
  }
}

const findAvailableId = (usuarios) => { 
  const sortedIds = usuarios.map(usuario => usuario.id).sort((a, b) => a - b); 
  //sort: ordena los elementos del array en orden ascendente. 
  // (a - b) significa que se ordenarán los elementos de manera ascendent, Si a es menor que b, (a - b)será negativo, lo que indica que a debe estar antes que b

  let availableId = 1; // Encuentra el primer ID disponible
  for (const id of sortedIds) {
    if (id !== availableId) { // Si el ID actual no es igual al ID disponible, se detiene y usa el ID disponible actual
      break;
    }
    availableId++; // Incrementa el ID disponible si está en uso
  }

  return availableId;
};


/* READ */
app.get("/", (req, res) => {
  res.send("Bienvenido a la API!");
});

app.get("/usuarios", (req, res) => {
  const data = readData();
  res.json(data.usuarios);
});

app.get("/usuarios/:id", (req, res) => {
  const data = readData();

  const id = parseInt(req.params.id);
  if (isNaN(id)) { // Verificar si no se proporcionó un ID en la solicitud  isNaN= "is not a number"
    return res.status(400).json({ mensaje: "Debe proporcionar un ID valido(solo se aceptan numeros) para eliminar un usuario" });
  }

  const usuario = data.usuarios.find((usuario) => usuario.id === id);
  if (!usuario) { // Verificar si no se encontró ningún usuario con el ID dado
    return res.status(404).json({ mensaje: "No se encontró ningún usuario con el ID proporcionado" });
  }

  res.json(usuario);
})

/* CREATE */
app.post("/usuarios", (req, res) => {
  const data = readData();
  const body = req.body;

   // Verificar si se proporciona al menos un dato del usuario en el cuerpo de la solicitud
   if (Object.keys(body).length === 0) { 
    return res.status(400).json({ mensaje: "Debe proporcionar al menos un dato para crear un nuevo usuario" });
  }

  const newId = findAvailableId(data.usuarios); // Encuentra el próximo ID disponible
  const newUsuario = {  // Crea un nuevo usuario con el nuevo ID
    id: newId,
    ...body,
  };

  data.usuarios.push(newUsuario);// Agrega el nuevo usuario a la lista

  writeData(data);
  res.json(newUsuario);
});

/* UPDATE */
app.put("/usuarios/:id", (req, res) =>{
  const data = readData();
  const body = req.body;

  const id = parseInt(req.params.id);
  if (isNaN(id)) { // Verificar si no se proporcionó un ID en la solicitud  isNaN= "is not a number"
    return res.status(400).json({ mensaje: "Debe proporcionar un ID valido(solo se aceptan numeros) para eliminar un usuario" });
  }
  
  const usuarioID = data.usuarios.findIndex((usuario) => usuario.id === id);
  if (usuarioID === -1) { // Verificar si el usuario con el ID dado existe
    return res.status(404).json({ mensaje: "No se encontró ningún usuario con el ID proporcionado" });
  }

  // Actualiza el usuario encontrado con los datos del body
  data.usuarios[usuarioID] = {
    ...data.usuarios[usuarioID], // Copia todas las propiedades del usuario existente
    ...body,  // Sobrescribe las propiedades existentes con las del cuerpo de la solicitud
  }

  writeData(data);
  res.json({mensaje : "El usuario se actualizo correctamente", usuario: data.usuarios[usuarioID]});
})


/* DELETE*/

app.delete("/usuarios/:id", (req, res) => {
  const data = readData();

  const id = parseInt(req.params.id);
  if (isNaN(id)) { // Verificar si no se proporcionó un ID en la solicitud  isNaN= "is not a number"
    return res.status(400).json({ mensaje: "Debe proporcionar un ID valido(solo se aceptan numeros) para eliminar un usuario" });
  }

  const usuarioID = data.usuarios.findIndex((usuario) => usuario.id === id);  
  if (usuarioID === -1) { // Verificar si el usuario con el ID dado existe
    return res.status(404).json({ mensaje: "No se encontró ningún usuario con el ID proporcionado" });
  }

  data.usuarios.splice(usuarioID, 1);
  writeData(data);
  res.json({mensaje : "El usuario se elimino correctamente"});
}) 

// Esta ruta sirve para dar un mensaje cuando no se especifica un ID para eliminar
app.delete("/usuarios", (req, res) => {  
  return res.status(400).json({ mensaje: "Debe proporcionar un ID para eliminar un usuario" });
});


app.listen(3000, () => {
  console.log("El servidor esta escuchando en el puerto 3000");
});

