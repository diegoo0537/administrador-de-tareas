//import { db, collection, addDoc ,getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc} from "./config.js";

var error = document.getElementById("error");
var email = document.getElementById("email");
var contraseña = document.getElementById("contraseña");
var botonAceptar = document.getElementById("boton-aceptar");
var botonOjo = document.getElementById("ojo");

async function registrarUsuario(){
    // campos vacios
    if(email.value === "" || contraseña.value === ""){
        error.style.display = "block";
        error.textContent = "Rellena todos los campos.";
        return false;
    }

    // email
    const regex = /@(gmail|outlook|yahoo|hotmail)\.(com|es|org)$|^[^\s@]+@[^\s@]+\.(com|es|org)$/;
    var emailValido = regex.test(email.value);
    console.log(emailValido);

    if(!emailValido){
        error.style.display = "block";
        error.textContent = "Formato de email incorrecto: usuario@dominio.com";
        return false;
    }

    const usuarios = await db.collection("usuarios").get();
    var emailExistente = false;

    usuarios.forEach((doc) => {
        if(doc.data().email === email.value){
            emailExistente = true;
        }
    });

    if(emailExistente){
        error.style.display = "block";
        error.textContent = "Ya existe un usuario con este email.";
        return false;
    }

    // contraseña
    if(contraseña.value.length < 6 || contraseña.value.length > 20){
        error.style.display = "block";
        error.textContent = "La contraseña debe tener entre 6 y 20 caracteres.";
        return false;
    }

    const contraseñaCifrada = await encrptarContraseña(contraseña.value);

    // registrar
    if(await registro(email.value, contraseñaCifrada)){
        email.value = "";
        contraseña.value = "";
        error.textContent = "";
        error.style.display = "none";

        alert("Usuario registrado.");
        return true;
    }else{
        alert("Error al registrar el usuario.");
        return false;
    }
}

async function registro(email, contraseña) {
    try {
        const documento = await db.collection("usuarios").add({
            email: email,
            contraseña: contraseña,
            tareas: []
        });
        console.log("Usuario registrado con ID: ", documento.id);
        return true;
    } catch (error) {
        console.error("Error registrando usuario: ", error);
        return false;
    }
}

async function encrptarContraseña(contraseña) {
    const encoder = new TextEncoder();
    const data = encoder.encode(contraseña);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', function() {
    botonOjo.addEventListener("click", () => {
        if(botonOjo.src.includes("imagenes/ojo_cerrado.png")){
            botonOjo.src = "imagenes/ojo_abierto.png"
            contraseña.type = "text";
        }else{
            botonOjo.src = "imagenes/ojo_cerrado.png"
            contraseña.type = "password";
        }
    });
    
    botonAceptar.addEventListener("click", async (event) => {
        event.preventDefault();

        if(await registrarUsuario()){
            window.location.href = 'index.html';
        }
    });
});