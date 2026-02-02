document.getElementById('advancedForm').addEventListener('submit', function(e) {
    // Iterar sobre todos los inputs
    const inputs = this.querySelectorAll('input');
    inputs.forEach(input => {
        // Eliminar el parámetro si el valor está vacío
        if (!input.value.trim()) {
            input.disabled = true;  // Deshabilitar el campo vacío
        }
    });
});