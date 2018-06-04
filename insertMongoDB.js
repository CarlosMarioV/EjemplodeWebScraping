var fs = require('fs')
var MongoClient = require('mongodb').MongoClient

var readJsonFile = function () {
    // Se lee el archivo de configuración de la base de datos
    //Direccion de donde se encuentra el documento dbConfiguration.json, 
    //por cuestiones de windows 10 la direccion se escribe con doble \\ 
    var connectionParams = fs.readFileSync('C:\\Users\\dell\\Documents\\@Aplicaciones Web _Node_\\Web Scraping -Web Elective\\dbConfiguration.json');
    //
    var dbConfig = {}
    try {
        // se convierte a JSON
        dbConfig = JSON.parse(connectionParams);
    } catch (err) {
        console.log(err);
    }
    return dbConfig
}

/**
 * Encuenta todos los documentos que coincidan con lo especificado en la query.
 * 
 * @param {any} queryParams
 *   var queryParams = {
 *       query: { "nombre llave": "especificar el valor" },
 *       collection: 'nombre de la colección'
 *   } 
 * @param {any} callback 
 */
exports.findDocuments = function findDocuments(queryParams, callback) {
    var dbUrl = 'mongodb://'
    var dbConfig = readJsonFile()
    // se crea la URL de conexión
    dbUrl = dbUrl.concat(dbConfig.params.host, ':', dbConfig.params.port, '/', dbConfig.params.database)

    // Usa el método connect para conectar al servidor
    MongoClient.connect(dbUrl, function (err, db) {
        if (err) {
            callback({
                success: false,
                data: null, // ['Error de conexión a la base de datos']
                message: 'Error de conexión a la base de datos'
            })
            return
        }
        // se recupera la colección requerida
        var collection = db.collection(queryParams.collection)
        // Se buscan los documentos
        collection.find(queryParams.query).toArray(function (err, docs) {
            var res
            if (err) {
                res = {
                    success: false,
                    data: null,
                    message: 'Error al obtener los documentos de la colección ' + queryParams.collection
                }
            } else {
                if (docs.length > 0) {
                    res = {
                        success: true,
                        data: docs,
                        message: 'Documentos recuperado exitosamente'
                    }
                } else {
                    res = {
                        success: false,
                        data: null,
                        message: 'No hay registros disponibles'
                    }
                }
            }
            db.close()
            callback(res)
        })
    })
}

/**
 * Encontrar un solo documento en la base de datos, especificado por la query.
 *
 * 
 * @param {any} queryParams 
 *   var queryParams = {
 *       query: { "nombre llave": "especificar el valor" },
 *       collection: 'nombre de la colección'
 *   } 
 * @param {any} callback = function 
 */
exports.findOneDocument = function findOneDocument(queryParams, callback) {
    var dbUrl = 'mongodb://'
    var dbConfig = readJsonFile()
    // se crea la URL de conexión
    dbUrl = dbUrl.concat(dbConfig.params.host, ':', dbConfig.params.port, '/', dbConfig.params.database)
    // Usa el método connect para conectar al servidor
    MongoClient.connect(dbUrl, function (err, db) {
        if (err) {
            callback({
                success: false,
                data: ['Error de conexión a la base de datos'],
                message: null
            })
            return
        }
        // se recupera la colección requerida
        var collection = db.collection(queryParams.collection)
        // Se buscan los documentos
        collection.findOne(queryParams.query, function (err, doc) {
            var res
            if (err) {
                res = {
                    success: false,
                    data: null,
                    message: 'Error al obtener los documentos de la colección ' + queryParams.collection
                }
            } else {
                if (doc) {
                    res = {
                        success: true,
                        data: doc,
                        message: 'Documento recuperado exitosamente'
                    }
                } else {
                    res = {
                        success: true,
                        data: null,
                        message: 'No hay registros disponibles'
                    }
                }
            }
            db.close()
            callback(res)
        })
    })
}

/**
 * Agrega un documento a la base de datos, en la coleccion especificado.
 * 
 * @param {any} queryParams
 *   var queryParams = {
 *       query: { "nombre llave": "especificar el valor" },
 *       collection: 'nombre de la colección'
 *   } 
 * @param {any} callback 
 */
exports.addDocument = function addDocument(queryParams, callback) {
    var dbUrl = 'mongodb://'
    var dbConfig = readJsonFile()
    // se crea la URL de conexión
    dbUrl = dbUrl.concat(dbConfig.params.host, ':', dbConfig.params.port, '/', dbConfig.params.database)

    // Usa el método connect para conectar al servidor
    MongoClient.connect(dbUrl, function (err, db) {
        if (err) {
            callback({
                success: false,
                data: queryParams.query,
                message: null
            })
            return
        }
        // se recupera la colección requerida
        var collection = db.collection(queryParams.collection)
        // Se buscan los documentos
        collection.insert(queryParams.query, function (err, result) {
            var res
            if (err) {
                res = {
                    success: false,
                    data: queryParams.query,
                    message: 400
                }
            } else {
                res = {
                    success: true,
                    data: queryParams.query,
                    message: 200
                }
            }
            db.close()
            callback(res)
        })
    })
}

/**
 * Actualiza un documento en la base de datos, buscar informacio de como actualizar los documentos en MongoDB.
 * 
 * @param {any} params 
 * @param {any} callback 
 */
exports.updateDocument = function updateDocument(params, callback) {
    var dbUrl = 'mongodb://'
    var dbConfig = readJsonFile()
    // se crea la URL de conexión
    dbUrl = dbUrl.concat(dbConfig.params.host, ':', dbConfig.params.port, '/', dbConfig.params.database)

    // Usa el método connect para conectar al servidor
    MongoClient.connect(dbUrl, function (err, db) {
        if (err) {
            callback({
                success: false,
                data: ['Error de conexión a la base de datos'],
                message: null
            })
            return
        }
        // se recupera la colección requerida
        var collection = db.collection(params.collection)
        // Se actualiza el documento
        collection.updateOne(params.findQuery, params.updateQuery, {
            upsert: true
        }, function (err, result) {
            var res
            if (err) { // error en la conexión
                res = {
                    success: false,
                    data: null,
                    message: 400
                }
            } else { // éxito
                res = {
                    success: true,
                    data: null,
                    message: 200
                }
            }
            db.close()
            callback(res)
        })
    })
}

exports.deleteDocument = function (params, callback) {
    var dbUrl = 'mongodb://'
    var dbConfig = readJsonFile()
    // se crea la URL de conexión
    dbUrl = dbUrl.concat(dbConfig.params.host, ':', dbConfig.params.port, '/', dbConfig.params.database)

    // Usa el método connect para conectar al servidor
    MongoClient.connect(dbUrl, function (err, db) {
        if (err) {
            callback({
                success: false,
                data: ['Error de conexión a la base de datos'],
                message: null
            })
            return
        }
        // se recupera la colección requerida
        var collection = db.collection(params.collection)
        // Elimina un documento de la base de datos...
        collection.remove(params.query, function (err, result) {
            var res
            if (err) { // error en la conexión
                res = {
                    success: false,
                    data: null,
                    message: 400
                }
            } else { // éxito
                res = {
                    success: true,
                    data: null,
                    message: 200
                }
            }
            db.close()
            callback(res)
        })
    })
}

/**
 * Obtiene la ultima insercion en la base de datos, segun la coleccion que le envien.
 * 
 * @param {JSON} queryParams : {collection: "collection"}
 * @param {function} callback 
 */
exports.getLastRegister = function (queryParams, callback) {
    var dbUrl = 'mongodb://'
    var dbConfig = readJsonFile()
    // se crea la URL de conexión
    dbUrl = dbUrl.concat(dbConfig.params.host, ':', dbConfig.params.port, '/', dbConfig.params.database)

    // Usa el método connect para conectar al servidor
    MongoClient.connect(dbUrl, function (err, db) {
        if (err) {
            callback({
                success: false,
                data: ['Error de conexión a la base de datos'],
                message: 'Error de conexión a la base de datos'
            })
            return
        }
        // se recupera la colección requerida
        var collection = db.collection(queryParams.collection)
        // Se buscan los documentos
        // db.reserveLog.find().sort({_id: -1}).limit(1)
        collection.find({}, {
            sort: [
                ['_id', -1]
            ],
            limit: 1
        }).toArray(function (err, docs) {
            var res
            if (err) {
                res = {
                    success: false,
                    data: null,
                    message: 400
                }
            } else {
                if (docs.length === 0) {
                    res = {
                        success: true,
                        data: [{
                            activa: false
                        }],
                        message: 201
                    }
                } else {
                    res = {
                        success: true,
                        data: docs,
                        message: 201
                    }
                }
            }
            db.close()
            callback(res)
        })
    })
}