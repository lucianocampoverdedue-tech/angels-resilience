let carrito = [];
let total = 0;

const botones = document.querySelectorAll(".producto button");

botones.forEach((boton) => {
    boton.addEventListener("click", () => {
        const producto = boton.parentElement;
        const nombre = producto.querySelector("h3").textContent;
        const precioTexto = producto.querySelector("p").textContent;
        const precio = parseFloat(precioTexto.replace("Precio: $", ""));

        carrito.push({ nombre, precio });
        total += precio;
        actualizarCarrito();
    });
});

function actualizarCarrito() {
    const contenedor = document.getElementById("carrito");
    contenedor.innerHTML = "";

    if(carrito.length === 0){
        contenedor.innerHTML = "<p>No hay productos en el carrito.</p>";
    }

    carrito.forEach((item, index) => {
        const p = document.createElement("p");
        p.textContent = `${item.nombre} - $${item.precio}`;

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "❌";
        botonEliminar.style.marginLeft = "10px";
        botonEliminar.addEventListener("click", () => {
            eliminarProducto(index);
        });

        p.appendChild(botonEliminar);
        contenedor.appendChild(p);
    });

    document.getElementById("total").textContent = `Total: $${total.toFixed(2)}`;
    document.getElementById("contador").textContent = carrito.length;
}

function eliminarProducto(index) {
    total -= carrito[index].precio;
    carrito.splice(index, 1);
    actualizarCarrito();
}

// Abrir y cerrar carrito flotante
const iconoCarrito = document.getElementById("icono-carrito");
const carritoPanel = document.getElementById("carrito-panel");
const cerrarCarrito = document.getElementById("cerrar-carrito");

iconoCarrito.addEventListener("click", () => {
    carritoPanel.classList.add("mostrar");
});

cerrarCarrito.addEventListener("click", () => {
    carritoPanel.classList.remove("mostrar");
});

// PayPal integración
paypal.Buttons({
    createOrder: function(data, actions) {
        if(carrito.length === 0){
            alert("El carrito está vacío");
            return;
        }
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: total.toFixed(2)
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            alert("¡Pago completado por " + details.payer.name.given_name + "!");
            carrito = [];
            total = 0;
            actualizarCarrito();
            carritoPanel.classList.remove("mostrar");
        });
    }
}).render('#paypal-button-container');
