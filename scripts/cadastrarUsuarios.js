const async = require('async');
const mongoose = require('mongoose');
var User = require('../model/user.js');

/**
 * ESSE SCRIPT LIMPA TODO O BANCO DE DADOS
 * 
 * e cadastra os usuários especificados.
 * 
 * Basta, utilizando o terminal, na pasta raiz do sistema, rodar 'node ./scripts/cadastrarUsuarios.js'.
 * 
 * Não sei se o 'node' vai estar disponivel para ser usado no bash do Windows, senão, busca no Google.
 * 
 * Para personalizar os usuários cadastrados, basta modificar a partir da linha 27 neste arquivo
 */
function criaUsuarios() {
    
        async.waterfall([
        // 1. Remover tudo do sistema
        (done)=>{
            mongoose.connection.db.dropDatabase((err)=>{
                return done(err);
            });
        },
        // 2. Criar os Usuarios
        (done) => {
            const usuarios = [{
		    	_id: 'lojinha1',
		    	password: '1lojinha',
		    	profile: {
		    		name: 'Lojinha 1',
		    		level: 1,
		    		isAdmin: false
		    	}
            },
            {
		    	_id: 'lojinha2',
		    	password: '2lojinha',
		    	profile: {
		    		name: 'Lojinha 2',
		    		level: 1,
		    		isAdmin: false
		    	}
            },
            {
		    	_id: 'lojinha3',
		    	password: '3lojinha',
		    	profile: {
		    		name: 'Lojinha 3',
		    		level: 1,
		    		isAdmin: false
		    	}
            }];
            User.collection.insert(usuarios, (err, docs)=>{
                if (err){
                    return done(err);
                }
                return done();
            });
        }], (err, ok)=>{
            if (err){
                console.log(err);
            }else{
                console.log('DEU CERTO');
            }
        });
    };
    

mongoose.connect('mongodb://localhost/ejdcard').then(() => {
    criaUsuarios();
}, (err) => {
    console.log('Ocorreu um erro');
    console.log(err);
});