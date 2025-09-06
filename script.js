let carrito = [];
let total = 0;

const botones = document.querySelectorAll(".producto button");
const iconoCarrito = document.getElementById("icono-carrito");

// Función para actualizar carrito
function actualizarCarrito() {
    const contenedor = document.getElementById("carrito");
    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>No hay productos en el carrito.</p>";
    }

    carrito.forEach((item, index) => {
        const p = document.createElement("p");

        const img = document.createElement("img");
        img.src = item.imagen;
        img.style.width = "30px";
        img.style.height = "30px";
        img.style.borderRadius = "5px";
        img.style.objectFit = "cover";
        p.appendChild(img);

        const span = document.createElement("span");
        span.textContent = ` ${item.nombre} - $${item.precio}`;
        p.appendChild(span);

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "❌";
        botonEliminar.addEventListener("click", () => eliminarProducto(index));
        p.appendChild(botonEliminar);

        contenedor.appendChild(p);
    });

    document.getElementById("total").textContent = `Total: $${total.toFixed(2)}`;
    document.getElementById("contador").textContent = carrito.length;
}

// Eliminar producto
function eliminarProducto(index) {
    total -= carrito[index].precio;
    carrito.splice(index, 1);
    actualizarCarrito();
}

// Animación avanzada: volar en curva + rebote en carrito
botones.forEach(boton => {
    boton.addEventListener("click", (e) => {
        const producto = e.target.closest(".producto");
        const nombre = producto.querySelector("h3").textContent;
        const precioTexto = producto.querySelector("p").textContent;
        const precio = parseFloat(precioTexto.replace("Precio: $", ""));
        const imagen = producto.querySelector("img").src;

        // Añadimos al carrito
        carrito.push({ nombre, precio, imagen });
        total += precio;
        actualizarCarrito();

        // --- Crear clon de imagen para animación ---
        const clon = producto.querySelector("img").cloneNode(true);
        const rect = producto.querySelector("img").getBoundingClientRect();
        const carritoRect = iconoCarrito.getBoundingClientRect();

        clon.style.position = "absolute";
        clon.style.left = rect.left + "px";
        clon.style.top = rect.top + "px";
        clon.style.width = rect.width + "px";
        clon.style.height = rect.height + "px";
        clon.style.borderRadius = "5px";
        clon.style.pointerEvents = "none";
        clon.style.zIndex = 200;
        document.body.appendChild(clon);

        // Animación curva usando requestAnimationFrame
        const duration = 800; // ms
        const start = performance.now();

        const startX = rect.left;
        const startY = rect.top;
        const endX = carritoRect.left + 10; // un poco dentro del icono
        const endY = carritoRect.top + 10;

        const controlX = startX + (endX - startX) / 2; // punto medio horizontal
        const controlY = startY - 150; // altura curva

        function animate(time) {
            let t = (time - start) / duration;
            if (t > 1) t = 1;

            // Curva cuadrática (Bezier)
            const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
            const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;
            const scale = 1 - 0.8 * t; // escala hasta 0.2
            const rotate = 20 * t;

            clon.style.transform = `translate(${x - startX}px, ${y - startY}px) scale(${scale}) rotate(${rotate}deg)`;
            clon.style.opacity = 1 - t;

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // Rebote en el carrito
                clon.style.transition = "transform 0.3s ease-out";
                clon.style.transform = "translate(0, -10px) scale(0.2)";
                setTimeout(() => clon.remove(), 300);
            }
        }
        requestAnimationFrame(animate);

        // Efecto de brillo en el carrito
        iconoCarrito.classList.add("agregar-brillo");
        setTimeout(() => iconoCarrito.classList.remove("agregar-brillo"), 500);
    });
});

// Abrir y cerrar carrito
const carritoPanel = document.getElementById("carrito-panel");
const cerrarCarrito = document.getElementById("cerrar-carrito");
const overlay = document.getElementById("overlay");

iconoCarrito.addEventListener("click", () => {
    carritoPanel.classList.add("mostrar");
    overlay.style.display = "block";
});

cerrarCarrito.addEventListener("click", () => {
    carritoPanel.classList.remove("mostrar");
    overlay.style.display = "none";
});

overlay.addEventListener("click", () => {
    carritoPanel.classList.remove("mostrar");
    overlay.style.display = "none";
});

// PayPal integración
paypal.Buttons({
    createOrder: function(data, actions) {
        if (carrito.length === 0) {
            alert("El carrito está vacío");
            return;
        }
        return actions.order.create({
            purchase_units: [{ amount: { value: total.toFixed(2) } }]
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
