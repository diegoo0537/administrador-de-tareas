//import { db, collection, addDoc ,getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc} from "./config.js";
//usuario
const emailUsuario = localStorage.getItem('emailUsuario');
const idUsuario = localStorage.getItem('idUsuario');
console.log("idUsuario:", localStorage.getItem('idUsuario'));
//console.log("emailUsuario:", localStorage.getItem('emailUsuario'));

// lista de tareas
var listaTareas = new Set();

var draggedElement = null;

// CONTENIDO
var botonAñadir = document.getElementById("boton-añadir-tarea");
var menuOpciones = document.getElementById("opciones");
var botonOpciones = document.getElementById("boton-opciones");
var imagenFlecha = document.getElementById("img-flecha");
var botonSalir = document.getElementById("boton-salir");
var botonBaja = document.getElementById("boton-baja");
var contenido = document.getElementById("contenido");
var pendiente = document.getElementById("pendiente");
var enProceso = document.getElementById("en-proceso");
var terminado = document.getElementById("terminado");
var panel1 = document.getElementById("panel-1");
var panel2 = document.getElementById("panel-2");
var panel3 = document.getElementById("panel-3");
var seleccionTipo = document.getElementById("seleccion-tipo");
var botonEliminar = document.getElementById("boton-eliminar-tarea");
var popUp = document.getElementById("pop-up");
var botonCancelar = document.getElementById("cancelar");
var botonAñadirTarea = document.getElementById("guardar-tarea");
var nombreTarea = document.getElementById("nombre-tarea");
var tipoTarea = document.getElementById("tipo-tarea");
var descripcionTarea = document.getElementById("descripcion-tarea");
var mensajeError = document.getElementById("error");

// listas
var contenidos = [pendiente, enProceso, terminado];
var paneles = [panel1, panel2, panel3];
var cabeceras = ["Pendiente", "En proceso", "Terminado"];

// funcionamiento arrastrar y soltar
function dragstartHandler(ev) {
    draggedElement = ev.target;
    ev.target.style.opacity = "0.4";
    ev.dataTransfer.setData("text/plain", ev.target.id);
    ev.dataTransfer.effectAllowed = "move";
}

function dragendHandler(ev) {
    ev.target.style.opacity = "1";
    draggedElement = null;
}

function dragoverHandler(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
    
    // Añadir estilo visual al panel sobre el que estamos
    let panel = ev.currentTarget;
    panel.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
}

function dragleaveHandler(ev) {
    // Remover estilo visual cuando salimos del panel
    let panel = ev.currentTarget;
    panel.style.backgroundColor = "";
}

function dropHandler(ev) {
    ev.preventDefault();
    
    // Remover estilo visual
    let panel = ev.currentTarget;
    panel.style.backgroundColor = "";
    
    if (draggedElement && panel !== draggedElement.parentNode) {
        // Obtener el contenedor padre del panel (pendiente, en-proceso, terminado)
        let targetContainer = panel.parentElement;
        
        // Actualizar el tipo de tarea en el Set
        actualizarTipoTarea(draggedElement.id, targetContainer.id);
        
        // Mover el elemento visualmente al panel
        panel.appendChild(draggedElement);
        
        console.log(`Tarea "${draggedElement.id}" movida a ${targetContainer.id}`);
    }
}

/***/
// Detectar si es dispositivo móvil
function esDispositivoMovil() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0) ||
        (window.innerWidth <= 768));
}

// EVENTOS TOUCH PARA MÓVIL
function touchStartHandler(ev) {
    // Verificar si el touch es en el botón eliminar
    if (ev.target.tagName === 'BUTTON' || ev.target.id === 'boton-eliminar' || ev.target.tagName === 'SELECCT' || ev.target.id === 'seleccion-tipo') {
        console.log("Touch en botón, ignorar drag");
        return; // No hacer nada si es el botón
    }

    ev.preventDefault();
    draggedElement = ev.currentTarget;
    draggedElement.style.opacity = "0.4";
    
    // Para móvil, necesitamos guardar la posición inicial
    const touch = ev.touches[0];
    draggedElement.startX = touch.clientX;
    draggedElement.startY = touch.clientY;
    
    console.log("Touch start en:", draggedElement.id);
}

function touchMoveHandler(ev) {
    if (!draggedElement) return;
    ev.preventDefault();
    
    const touch = ev.touches[0];
}

function touchEndHandler(ev) {
    if (!draggedElement) return;
    ev.preventDefault();
    
    const touch = ev.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Buscar el panel destino
    let targetPanel = encontrarPanelDestino(elementBelow);
    
    if (targetPanel && targetPanel !== draggedElement.parentNode) {
        let targetContainer = targetPanel.parentElement;
        
        // Actualizar el tipo de tarea
        actualizarTipoTarea(draggedElement.id, targetContainer.id);
        
        // Mover el elemento visualmente
        targetPanel.appendChild(draggedElement);
        
        console.log(`Tarea "${draggedElement.id}" movida a ${targetContainer.id} (móvil)`);
    }
    
    // Restaurar estilo
    draggedElement.style.opacity = "1";
    draggedElement = null;
}

// Encontrar el panel destino basado en la posición del touch
function encontrarPanelDestino(element) {
    while (element && element !== document.body) {
        if (element.classList && 
            (element.id === 'panel-1' || element.id === 'panel-2' || element.id === 'panel-3')) {
            return element;
        }
        element = element.parentElement;
    }
    return null;
}

// Configurar eventos touch para móvil
function configurarTouchEvents() {
    if (!esDispositivoMovil()) return;
    
    console.log("Configurando drag & drop táctil");
    
    const tareas = document.querySelectorAll('.tarea');
    tareas.forEach(tarea => {
        tarea.addEventListener('touchstart', touchStartHandler, { passive: false });
        tarea.addEventListener('touchmove', touchMoveHandler, { passive: false });
        tarea.addEventListener('touchend', touchEndHandler, { passive: false });
    });
    
    // También configurar los paneles para aceptar drops táctiles
    paneles.forEach(panel => {
        panel.addEventListener('touchend', touchEndHandler, { passive: false });
    });
}

// Actualizar el tipo de tarea en el Set
/*function actualizarTipoTarea(nombreTarea, nuevoContenedor) {
    let nuevaCategoria = "";
    
    if (nuevoContenedor === "pendiente") {
        nuevaCategoria = "Pendiente";
    } else if (nuevoContenedor === "en-proceso") {
        nuevaCategoria = "En proceso";
    } else if (nuevoContenedor === "terminado") {
        nuevaCategoria = "Terminado";
    }
    
    // Buscar y actualizar la tarea
    let tareaEncontrada = null;
    listaTareas.forEach(tarea => {
        if (tarea.nombre === nombreTarea) {
            tareaEncontrada = tarea;
        }
    });
    
    if (tareaEncontrada) {
        const tareaActualizada = {
            nombre: tareaEncontrada.nombre,
            tipo: nuevaCategoria,
            descripcion: tareaEncontrada.descripcion
        };
        
        listaTareas.delete(tareaEncontrada);
        listaTareas.add(tareaActualizada);
        
        console.log(`Tarea "${nombreTarea}" actualizada a: ${nuevaCategoria}`);
    }
}*/
async function actualizarTipoTarea(nombreTarea, nuevoContenedor) {
    let nuevaCategoria = "";
    
    if (nuevoContenedor === "pendiente") {
        nuevaCategoria = "Pendiente";
    } else if (nuevoContenedor === "en-proceso" || nuevoContenedor === "en proceso") {
        nuevaCategoria = "En proceso";
    } else if (nuevoContenedor === "terminado") {
        nuevaCategoria = "Terminado";
    }
    
    // Buscar y actualizar la tarea
    let tareaEncontrada = null;
    listaTareas.forEach(tarea => {
        if (tarea.nombre === nombreTarea) {
            tareaEncontrada = tarea;
        }
    });
    
    if (tareaEncontrada) {
        const tareaActualizada = {
            nombre: tareaEncontrada.nombre,
            tipo: nuevaCategoria,
            descripcion: tareaEncontrada.descripcion
        };
        
        listaTareas.delete(tareaEncontrada);
        listaTareas.add(tareaActualizada);
        
        await guardarTareasEnFirebase();
        await cargarTareas();
        
        console.log(`Tarea "${nombreTarea}" actualizada a: ${nuevaCategoria}`);
    }
}

// Configurar drag and drop para los paneles
function configurarDragAndDrop() {
    paneles.forEach(panel => {
        // Limpiar eventos existentes primero
        panel.removeEventListener('dragover', dragoverHandler);
        panel.removeEventListener('dragleave', dragleaveHandler);
        panel.removeEventListener('drop', dropHandler);
        
        // Añadir nuevos eventos
        panel.addEventListener('dragover', dragoverHandler);
        panel.addEventListener('dragleave', dragleaveHandler);
        panel.addEventListener('drop', dropHandler);
        
        // Asegurar que los paneles acepten drops
        panel.setAttribute('droppable', 'true');
    });
}

// guardar tareas en firebase
async function guardarTareasEnFirebase() {
    try {
        await db.collection("usuarios").doc(idUsuario).update({
            tareas: Array.from(listaTareas)
        });
    } catch (error) {
        console.error("Error guardando tareas:", error);
    }
}

// limpiar contenedores
function limpiarContenedores() {
    paneles.forEach(panel => {
        while(panel.children.length > 0) {
            panel.removeChild(panel.lastChild);
        }
    });
}

// cargar tareas
async function cargarTareas(){
    limpiarContenedores();

    const usuario = await db.collection("usuarios").doc(idUsuario).get();

    if(usuario.exists){
        const tareasUsuario = usuario.data().tareas || [];
        listaTareas = new Set(tareasUsuario);
    }

    if(listaTareas.size>0){
        listaTareas.forEach(tarea => {
            var divTarea = document.createElement("div");
            divTarea.id = `${tarea.nombre}`;
            divTarea.draggable = "true";
            divTarea.classList.add("tarea");

            // Eliminar event listeners existentes primero
            divTarea.removeEventListener('dragstart', dragstartHandler);
            divTarea.removeEventListener('dragend', dragendHandler);
            
            // Añadir event listeners
            divTarea.addEventListener('dragstart', dragstartHandler);
            divTarea.addEventListener('dragend', dragendHandler);
            
            var selectHtml = `<select id="seleccion-tipo" onchange="actualizarTipoTarea('${tarea.nombre}', this.value)">
                                <option value="pendiente" ${tarea.tipo === "Pendiente" ? 'selected' : ''}>Pendiente</option>
                                <option value="en proceso" ${tarea.tipo === "En proceso" ? 'selected' : ''}>En proceso</option>
                                <option value="terminado" ${tarea.tipo === "Terminado" ? 'selected' : ''}>Terminado</option>
                            </select>`;

            var htmlTarea = `<p id="nombre"><b>${tarea.nombre}</b></p>
                            <p id="descripcion">${tarea.descripcion}</p>
                            ${selectHtml}
                            <button id="boton-eliminar" onclick="eliminarTarea('${tarea.nombre}')">Eliminar</button>`;
            
            divTarea.innerHTML = htmlTarea;

            if(tarea.tipo == "Pendiente"){
                panel1.appendChild(divTarea);
            } else if(tarea.tipo == "En proceso"){
                panel2.appendChild(divTarea);
            } else if(tarea.tipo == "Terminado"){
                panel3.appendChild(divTarea);
            }
        });
    }

    configurarDragAndDrop();
    configurarTouchEvents();
}

// funcion eliminar tarea
/*function eliminarTarea(nombreTarea){
    if(confirm("¿Quieres eliminar la tarea '"+nombreTarea+"'?")){
        listaTareas.forEach(item =>{
            if(item.nombre == nombreTarea){
                listaTareas.delete(item);
                cargarTareas();
            }
        });
    }
}*/
async function eliminarTarea(nombreTarea){
    if(confirm("¿Quieres eliminar la tarea '"+nombreTarea+"'?")){
        let tareaAEliminar = null;
        listaTareas.forEach(item => {
            if(item.nombre == nombreTarea){
                tareaAEliminar = item;
            }
        });
        
        if (tareaAEliminar) {
            listaTareas.delete(tareaAEliminar);
            await guardarTareasEnFirebase();
            cargarTareas();
        }
    }
}

// funcion añadir tarea
/*function añadirTarea(){
    if(nombreTarea.value.trim() === ""){
        mensajeError.style.display = "block";
        mensajeError.textContent = "Completa el campo nombre";
        
        return false;
    }

    var tareaExistente = Array.from(listaTareas).some(tarea => 
        tarea.nombre === nombreTarea.value.trim()
    );

    if(tareaExistente){
        mensajeError.style.display = "block";
        mensajeError.textContent = "Ya existe una tarea con ese nombre";
        
        return false;
    }
    
    var tarea = {
        nombre: nombreTarea.value.trim(),
        tipo: tipoTarea.value,
        descripcion: descripcionTarea.value
    };

    listaTareas.add(tarea)
    alert("Tarea añadida correctamente");
    
    cargarTareas();
    nombreTarea.value = "";
    tipoTarea.value = "Pendiente";
    descripcionTarea.value = "";
    mensajeError.style.display = "none";

    return true;
}*/
async function añadirTarea(){
    if(nombreTarea.value.trim() === ""){
        mensajeError.style.display = "block";
        mensajeError.textContent = "Completa el campo nombre";
        return false;
    }

    var tareaExistente = Array.from(listaTareas).some(tarea => 
        tarea.nombre === nombreTarea.value.trim()
    );

    if(tareaExistente){
        mensajeError.style.display = "block";
        mensajeError.textContent = "Ya existe una tarea con ese nombre";
        return false;
    }
    
    var tarea = {
        nombre: nombreTarea.value.trim(),
        tipo: tipoTarea.value,
        descripcion: descripcionTarea.value
    };

    listaTareas.add(tarea);
    
    await guardarTareasEnFirebase();
    
    alert("Tarea añadida correctamente");
    cargarTareas();

    nombreTarea.value = "";
    tipoTarea.value = "Pendiente";
    descripcionTarea.value = "";
    mensajeError.style.display = "none";

    return true;
}

// eventos
document.addEventListener('DOMContentLoaded', function() {
    cargarTareas();
    configurarDragAndDrop();

    botonAñadir.addEventListener("click", () => {
        popUp.style.display = "flex";
    });

    botonCancelar.addEventListener("click", () => {
        nombreTarea.value = "";
        tipoTarea.value = "Pendiente";
        descripcionTarea.value = "";
        popUp.style.display = "none";

        cargarTareas();
    });

    botonAñadirTarea.addEventListener("click", async(e) => {
        e.preventDefault(); // evitar que el formulario se envíe
        var resultado = await añadirTarea();

        if(resultado){
            popUp.style.display = "none";
        } else{
            popUp.style.display = "flex";
        }
    });

    botonOpciones.addEventListener("click", () => {
        // Verificar correctamente el display
        if(menuOpciones.style.display === "block"){
            imagenFlecha.src = "imagenes/flecha-derecha.png";
            menuOpciones.style.display = "none";
        } else {
            imagenFlecha.src = "imagenes/flecha-abajo.png";
            menuOpciones.style.display = "block";
        }
    });

    document.addEventListener('click', function(event) {
        if (!menuOpciones.contains(event.target) && event.target !== botonOpciones) {
            imagenFlecha.src = "imagenes/flecha-derecha.png";
            menuOpciones.style.display = "none";
        }

        if (!popUp.contains(event.target) && event.target !== botonAñadir) {
            popUp.style.display = "none";
        }
    });

    botonSalir.addEventListener("click", () => {
        if(confirm("¿Seguro que quieres salir?")){
            localStorage.removeItem('emailUsuario');
            localStorage.removeItem('idUsuario');
            window.location.href = 'index.html';
        }
    });

    botonBaja.addEventListener("click", async() => {
        if(confirm("¿Seguro que quieres darte de baja? Se eliminarán todos los datos.")){
            await db.collection("usuarios").doc(idUsuario).delete();
            localStorage.removeItem('emailUsuario');
            localStorage.removeItem('idUsuario');
            alert("Usuario eliminado correctamente");
            window.location.href = 'index.html';
        }
    });
});