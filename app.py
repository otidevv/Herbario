# app.py
from flask import Flask, render_template, request, redirect, url_for
import pyodbc
from config import DB_CONFIG

app = Flask(__name__)

def get_db_connection():
    """Establishes and returns a connection to the database"""
    connection_string = (
        f"DRIVER={DB_CONFIG['driver']};"
        f"SERVER={DB_CONFIG['server']};"
        f"DATABASE={DB_CONFIG['database']};"
        f"UID={DB_CONFIG['uid']};"
        f"PWD={DB_CONFIG['pwd']};"
        f"Encrypt=no;"
    )
    

    
    return pyodbc.connect(connection_string)

@app.route('/')
def index():
    """Renders the home/quick search page"""
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT Id , Genero_especie, nombre_cientifico, Colectores, Fecha_colecta, Pais, Departamento, 
                Provincia, Distrito, image_path
        FROM Datos  
        ORDER BY Id
        """

    cursor.execute(query)
    datos = cursor.fetchall()
    pagina = int(request.args.get('pagina', 1))
    por_pagina = 5
    inicio = (pagina - 1) * por_pagina
    fin = inicio + por_pagina

    # Resultados para esta página
    resultados = datos[inicio:fin]
    total_paginas = (len(datos) + por_pagina - 1) // por_pagina


    return render_template('index.html',
                           resultados=resultados,
                           pagina_actual=pagina,
                           total_paginas=total_paginas)

'''
@app.route('/busqueda_avanzada')
def busqueda_avanzada():
    """Renders the advanced search page"""
    return render_template('busqueda_avanzada.html')
'''
@app.route('/busqueda_rapida')
def busqueda_rapida():
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT Id , Genero_especie, nombre_cientifico, Colectores, Fecha_colecta, Pais, Departamento, 
                Provincia, Distrito, image_path
        FROM Datos  
        ORDER BY Genero_especie
        """

    cursor.execute(query)
    datos = cursor.fetchall()
    pagina = int(request.args.get('pagina', 1))
    por_pagina = 5
    inicio = (pagina - 1) * por_pagina
    fin = inicio + por_pagina

    # Resultados para esta página
    resultados = datos[inicio:fin]
    total_paginas = (len(datos) + por_pagina - 1) // por_pagina

    return render_template('busqueda_rapida.html',
                           resultados=resultados,
                           pagina_actual=pagina,
                           total_paginas=total_paginas)

@app.route('/buscar', methods=['GET'])
def buscar():
    """Performs a quick search based on the provided query"""
    query = request.args.get('query', '')
    if not query:
        return redirect(url_for('index'))
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Execute search query
        sql = """
        SELECT Id , Genero_especie, nombre_cientifico, Colectores, Fecha_colecta, Pais, Departamento, 
                Provincia, Distrito, image_path
        FROM Datos
        WHERE nombre_cientifico LIKE ? OR Genero_especie LIKE ? OR Departamento LIKE ?
        ORDER BY Genero_especie
        """
        
        # Count total results
        sql_count = """
        SELECT COUNT(*)
        FROM Datos
        WHERE nombre_cientifico LIKE ? OR Genero_especie LIKE ? OR Departamento LIKE ?
        """
        
        search_term = f'%{query}'
        cursor.execute(sql_count, (search_term, search_term, search_term))
        total_count = cursor.fetchone()[0]
        
        cursor.execute(sql, (search_term, search_term, search_term))
        datos = cursor.fetchall()
    
        # Obtener el número de página actual (por defecto 1)            
        pagina = int(request.args.get('pagina', 1))
        por_pagina = 5
        inicio = (pagina - 1) * por_pagina
        fin = inicio + por_pagina

        resultados = datos[inicio:fin]
        total_paginas = (len(datos) + por_pagina - 1) // por_pagina
        
        conn.close()
        print(total_count)
        return render_template(
            'resultados.html', 
            busqueda_rapida=True,
            resultados=resultados, 
            query=query, 
            total_count=total_count,
            pagina_actual=pagina,
            total_paginas=total_paginas
        )
    
    except Exception as e:
        return f"Error al realizar la búsqueda: {str(e)}", 500

@app.route('/busqueda_avanzada', methods=['GET'])
def busqueda_avanzada():
    #Realiza una búsqueda avanzada con múltiples criterios usando GET
    
    # Extraer parámetros de la URL (GET)
    familia = request.args.get('familia', '')
    genero = request.args.get('genero', '')
    nombre_cientifico = request.args.get('nombre_cientifico', '')
    colectores = request.args.get('colectores', '')
    fecha = request.args.get('fecha', '')
    pais = request.args.get('pais', '')
    departamento = request.args.get('departamento', '')
    provincia = request.args.get('provincia', '')
    distrito = request.args.get('distrito', '')
    localidad = request.args.get('localidad', '')  
    # Build SQL query dynamically
    conditions = []
    params = []
        
    if familia:
        conditions.append("familia LIKE ?")
        params.append(f'%{familia}%')
        
    if genero:
        conditions.append("genero LIKE ?")
        params.append(f'%{genero}%')
            
    if nombre_cientifico:
        conditions.append("nombre_cientifico LIKE ?")
        params.append(f'%{nombre_cientifico}%')
            
    if colectores:
        conditions.append("colectores LIKE ?")
        params.append(f'%{colectores}%')
            
    if fecha:
        conditions.append("fecha LIKE ?")
        params.append(f'%{fecha}%')
            
    if pais:
        conditions.append("pais LIKE ?")
        params.append(f'%{pais}%')
            
    if departamento:
        conditions.append("departamento LIKE ?")
        params.append(f'%{departamento}%')
            
    if provincia:
        conditions.append("provincia LIKE ?")
        params.append(f'{provincia}%')
            
    if distrito:
        conditions.append("distrito LIKE ?")
        params.append(f'%{distrito}%')
            
    if localidad:
        conditions.append("localidad LIKE ?")
        params.append(f'%{localidad}%')
                
        # If no conditions, return to the advanced search page
    if not conditions:
        print('no se reconcio los parametros')
        return render_template('busqueda_avanzada.html')
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
            
            # Construct WHERE clause
        where_clause = " AND ".join(conditions)
            
            # Prepare full SQL query
        sql = f"""
        SELECT Id , Genero_especie, nombre_cientifico, Colectores, Fecha_colecta, Pais, Departamento, 
                Provincia, Distrito, image_path
            FROM Datos
            WHERE {where_clause}
            ORDER BY nombre_cientifico
        """
            
            # Execute query
        cursor.execute(sql, params)
        datos = cursor.fetchall()
            
            # Count total results
        sql_count = f"SELECT COUNT(*) FROM Datos WHERE {where_clause}"
        cursor.execute(sql_count, params)
        total_count = cursor.fetchone()[0]

        pagina = int(request.args.get('pagina', 1))
        por_pagina = 5
        inicio = (pagina - 1) * por_pagina
        fin = inicio + por_pagina

        resultados = datos[inicio:fin]
        total_paginas = (len(datos) + por_pagina - 1) // por_pagina
            
        conn.close()
            
        return render_template(
            'resultados.html',
            resultados=resultados,
            busqueda_avanzada=True,
            total_count=total_count,
            pagina_actual=pagina,
            total_paginas=total_paginas
        )
            
    except Exception as e:
            return f"Error al realizar la búsqueda avanzada: {str(e)}", 500


@app.route('/especie/<Ncientifico>')

def especie(Ncientifico):
    id = request.args.get('id')
    print(id)
    """Displays detailed information about a specific specimen"""
    if not id:
        return "Espécimen no encontrado", 404
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Fetch specimen data
        cursor.execute("""
            SELECT nombre_cientifico,Nombre_comun,Genero_especie,Familia,Descripcion,
                       Determinado_por,Habito,Tipo_bosque,Ecozona,Colectores,Fecha_colecta,Pais,
                        Departamento,Provincia,Distrito,UTM,Este,Norte,Altitud,image_path
            FROM Datos
            WHERE Id = ?
        """, (id))
        
        especie_data = cursor.fetchone()
        print(especie_data)
        prueba=especie_data.image_path.split("/")
        print(prueba)
        conn.close()
        
        if not especie_data:
            return "Espécimen no encontrado", 404
            
        return render_template('viewer.html',resultados=prueba,datos=especie_data)
    
    except Exception as e:
        return f"Error al obtener la información del espécimen: {str(e)}", 500

if __name__ == '__main__':
    app.run(debug=True)