<!-- Navbar.svelte -->
<style>
  /* Estilos para la barra de navegación vertical */
  nav {
    background-color: #333; /* Color de fondo */
    color: #fff; /* Color del texto */
    position: fixed; /* Fija la barra de navegación en la posición */
    top: 0; /* Coloca la barra en la parte superior */
    left: 0; /* Coloca la barra en la parte izquierda */
    height: 100%; /* Ocupa todo el alto de la página */
    width: 200px; /* Ancho de la barra de navegación */
    display: flex; /* Utiliza el modelo de caja flexible para centrar contenido */
    flex-direction: column; /* Establece la dirección vertical */
    justify-content: center; /* Centra verticalmente el contenido */
  }

  ul {
    list-style: none; /* Quita los puntos de lista */
    padding: 0;
  }

  li {
    margin: 0; /* Elimina el margen en los elementos de lista */
  }

  a {
    display: block; /* Hace que los enlaces ocupen todo el ancho de la barra */
    text-decoration: none; /* Quita el subrayado de los enlaces */
    color: #fff; /* Color del texto de los enlaces */
    padding: 10px 20px; /* Espaciado interno en enlaces */
  }

  /* Estilos para los enlaces al pasar el cursor */
  a:hover {
    background-color: #555; /* Cambia el color de fondo en el hover */
  }
</style>

<nav>
  <ul>
    <li><a href="/">Main</a></li>
    <li><a target="_blank" href="https://raw.githubusercontent.com/celaut-project/ergo-reputation-system/main/docs/PRESENTATION.md">Paper</a></li>
  </ul>
</nav>
