//import { db, collection, addDoc ,getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc} from "./config.js";

var error = document.getElementById("error");
var email = document.getElementById("email");
var contraseña = document.getElementById("contraseña");
var botonAceptar = document.getElementById("boton-aceptar");
var botonOjo = document.getElementById("ojo");

async function loginUsuario(){
    // campos vacios
    if(email.value === "" || contraseña.value === ""){
        error.style.display = "block";
        error.textContent = "Rellena todos los campos.";
        return false;
    }

    const contraseñaCifrada = await encrptarContraseña(contraseña.value);

    // iniciar sesión
    if(await login(email.value, contraseñaCifrada)){
        email.value = "";
        contraseña.value = "";
        error.textContent = "";
        error.style.display = "none";

        return true;
    }else{
        alert("Usuario no registrado. Email o contraseña incorrectos.");
        return false;
    }
}

async function login(email, contraseña) {
    try {
        const usuario = await db.collection("usuarios")
            .where("email", "==", email)
            .where("contraseña", "==", contraseña)
            .get();

        if (!usuario.empty) {
            const userDoc = usuario.docs[0];
            const userData = userDoc.data();

            localStorage.setItem('idUsuario', userDoc.id);
            localStorage.setItem('emailUsuario', userData.email);
            console.log("idUsuario:", localStorage.getItem('idUsuario'));
            console.log("emailUsuario:", localStorage.getItem('emailUsuario'));

            email.value = "";
            contraseña.value = "";
            error.textContent = "";
            error.style.display = "none";

            console.log("Usuario", userDoc.id, "ha iniciado sesión: ");
            return true;
        }
    } catch (error) {
        console.error("Error al iniciar sesión: ", error);
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

    botonAceptar.addEventListener("click", async(event) => {
        event.preventDefault();
        
        if(await loginUsuario()){
            window.location.href = 'app.html';
        }
    });
});