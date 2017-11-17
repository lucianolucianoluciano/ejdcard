const prompt = require('prompt');
const User = require('../model/user.js');
const mongoose = require('mongoose');

prompt.start();
/**
 * Roda npm install na pasta root
 * e executa `node ./scripts/unicoUsuario.js`
 */
prompt.get(['usuario', 'senha', 'nome'], function (err, result) {
if (err) { return onErr(err); }

    mongoose.connect('mongodb://localhost/ejdcard').then(() => {
        const { usuario, senha, nome } = result;
        const user = new User({
		    	_id: usuario,
		    	password: senha,
		    	profile: {
		    		name: nome,
		    		level: 1,
		    		isAdmin: false
		    	}
            });
       User.hashifyAndSave(user, (err, ok)=>{
            if (err){
                console.log("Ocorreu um erro ao tentar criar o usuário");
                console.log(err);
                process.exit(0);
            }
            console.log(`Usuário ${nome} cadastrado com sucesso.`);
            process.exit(0);
        });
    }, (err) => {
        console.log('Ocorreu um erro');
        console.log(err);
    });
});

function onErr(err) {
console.log(err);
return 1;
}