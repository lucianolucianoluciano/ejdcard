<?php
date_default_timezone_set("America/Fortaleza");
require 'Slim/Slim/Slim.php';
\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim();
$app->response()->header('Content-Type', 'application/json;charset=utf-8');

function getConn(){
    return new PDO('mysql:host=localhost;dbname=ejdcard',
        'root',
        '',
        array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8")
    );
}

function geraLog($cartao, $estacao, $valor, $saldo, $tipo){
    try{
        $conn = getConn();
        $agora = date("Y-m-d H:i:s");
        $logsql = "INSERT INTO log (cartao, estacao, valor, saldo, tipo, hora) VALUES (:id, :estacao, :valor, :saldo, :tipo, :agora)";
        $logstmt = $conn->prepare($logsql);
        $logstmt->bindParam(':id', $cartao);
        $logstmt->bindParam(':estacao', $estacao);
        $logstmt->bindParam(':valor', $valor);
        $logstmt->bindParam(':saldo', $saldo);
        $logstmt->bindParam(':tipo', $tipo);
        $logstmt->bindParam(':agora', $agora);
        if($logstmt->execute()){
            return $conn->lastInsertId();
        }else{
            return false;
        }
    }catch (PDOException $e){
        return false;
    }

}

function getCartao($id)
{
    try {
        $conn = getConn();
        $sql = "SELECT * FROM cartoes WHERE id=:id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            $produto = $stmt->fetchObject();
            $produto->existe = true;
            $produto->erro = "0";
            echo json_encode($produto);
        } else {
            echo '{"existe": false, "erro": "1", "stringErro": "O cartão '.$id.' não está cadastrado"}';
        }
    } catch(PDOExecption $e){
        echo '{"erro": "1", "stringErro": "1707 - '.$e->getMessage().'"}';
    }

}
function existeCartao($id){
    $conn = getConn();
    $sql = "SELECT * FROM cartoes WHERE id=:id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam("id",$id);
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        $conn = null;
        return true;
    } else {
        $conn = null;
        return false;
    }

}

function ativoCartao($id){
    $conn = getConn();
    $sql = "SELECT * FROM cartoes WHERE id=:id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam("id",$id);
    $stmt->execute();
    if ($stmt->rowCount() == 0) {
        $conn = null;
        return false;
    }
    $card = $stmt->fetch(PDO::FETCH_OBJ);
    if ($card->ativo == "0"){
        $conn = null;
        return false;
    }else{
        $conn = null;
        return true;
    }

}

//Requisição que retornará o crédito atual do cartão
$app->get('/:id', 'getCartao');


//Requisiçao que até agora não vejo nenhum uso, mas seria pra retornar todos os cartões
$app->get('/', function () {
    echo "nao recebi nenhum numero de cartao";
});


//Requisição para cadastro do cartão na entrada do evento
$app->post('/', function () {
    $app = \Slim\Slim::getInstance();
    $request = $app->request();
    $body = $request->getBody();
    $data = json_decode($body, true);
    $nome = trim($data["nome"]);
    $data["celular"] = ($data["celular"] != '(83)9') ? $data["celular"] : ""; $celular = trim($data["celular"]);
    $id = trim($data['id']); // é bom não usar intval, talvez ele converta um caracter e seja reconhecido como um numero. fazemos o teste assim mesom
    $valorInicial = str_replace(",", ".", $data["valorInicial"]); //o PHP faz o calculo beleza, mas é bom fazer o calculo tanto com string como number e checar o resultado no final
    //$valor = floatval($valorInicial);
    $agora = date("Y-m-d H:i:s");
    if (existeCartao($id)){
        echo '{"erro": "1", "stringErro": "O cartão '.$id.' já está cadastrado"}';
    } elseif (strlen($nome) < 10 ){
        echo '{"erro": "1", "stringErro": "O campo Nome deve ter pelo menos 10 caracteres"}';
    } elseif ($id <= 0 || $id > 700){
        echo '{"erro": "1", "stringErro": "O campo Cartão deve conter um número inteiro entre 1 e 700"}';
    } elseif ($valorInicial == ""){
        echo '{"erro": "1", "stringErro": "O campo Valor Inicial deve ser preenchido"}';
    }else{
        try{
            $sql = "INSERT INTO cartoes (id, usuario, ativo, cadastro, inicial, saldo, last, celular) values (:id,:nome, '1',:agora, :valor, :valor, :agora, :celular) ";
            $conn = getConn();
            $stmt = $conn->prepare($sql);
            $stmt->bindParam("id",$id);
            $stmt->bindParam("nome",$nome);
            $stmt->bindParam("agora", $agora);
            $stmt->bindParam("valor", $valorInicial);
            $stmt->bindParam("celular", $celular);
            $execucao = $stmt->execute();
            if ($execucao){
                $conn = null;
                $log = geraLog($id, $data["estacao"], $valorInicial,$valorInicial, '1');
                if ($log){
                    $data['log'] = $log;
                    $data['erro'] = "0";
                    echo json_encode($data);
                }else{
                    echo '{"erro": "1", "stringErro": "Erro ao gerar log (cartão cadastrado) - Código do erro: 1705"}';
                }
                $conn = null;
            }else{
                echo '{"erro": "1", "stringErro":"Erro ao inserir - Código do erro: 1704"}';
            }
        } catch(PDOExecption $e){
            echo '{"erro": "1", "stringErro": "Código: 1706 - '.$e->getMessage().'"}';
        }
    }
});


//Requisição para débito (comprar coisas com o cartão)
$app->put('/pre', function () {
    $app = \Slim\Slim::getInstance();
    $request = $app->request();
    $body = $request->getBody();
    $data = json_decode($body, true);
    $id = $data['id'];
    $valor = trim(str_replace(",", ".", $data["valor"]));
    if (!existeCartao($id)){
        echo '{"erro": "1", "stringErro": "O cartão '.$id.' não está cadastrado"}';
    } elseif(!ativoCartao($id)){
        echo '{"erro": "1", "stringErro": "O cartão '.$id.' está desativado"}';
    }elseif($valor == "" or $valor == "." or $valor == "0"){
        echo '{"erro": "1", "stringErro": "O valor não é válido"}';
    }else{
        try {
            $conn = getConn();
            $sql = "SELECT id, usuario, saldo, ativo FROM cartoes WHERE id=:id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam("id", $id);
            $stmt->execute();
            $retorno = $stmt->fetchObject();
            if ($retorno->ativo == "0"){
                echo '{"erro": "1", "stringErro": "O cartão já foi finalizado"}';
            }else {
                $retorno->valor = $valor;
                $retorno->erro = "0";
                echo json_encode($retorno);
            }

        } catch(PDOExecption $e){
            echo '{"erro": "1", "stringErro": "Código 1708 - '.$e->getMessage().'"}';
        }
    }

});

$app->put('/', function () {
    $app = \Slim\Slim::getInstance();
    $request = $app->request();
    $body = $request->getBody();
    $data = json_decode($body, true);
    $agora = date("Y-m-d H:i:s");
    $id = $data['id'];
    $data["valor"] = trim(str_replace(",", ".", $data["valor"]));
    $valor = $data["valor"];
    $saldo = trim(str_replace(",", ".", $data["saldo"]));
    $data["proximoSaldo"] = trim(str_replace(",", ".", $data["proximoSaldo"]));
    $proximosaldo = $data["proximoSaldo"];
    //if ( abs((floatval($saldo) - floatval($valor) - $proximosaldo) < 0.0001) {
    //if ($saldo - $valor == $proximosaldo){ -- atualizado em 03/09
    if ((abs(floatval($saldo) - floatval($valor)) - $proximosaldo) < 0.0001){
        try {
            $con = getConn();
            $proximosaldo = floatval($saldo) - floatval($valor);
            $stmt = $con->prepare("UPDATE cartoes SET saldo = ?, last = ? WHERE id = ?");
            $stmt->bindParam(1, $proximosaldo);
            $stmt->bindParam(2, $agora);
            $stmt->bindParam(3, $id);
            $execucao = $stmt->execute();
            if ($execucao){
                $con = null;
                $log = geraLog($id, $data['estacao'], $valor, $proximosaldo, '2');
                if ($log){
                    $data['lognum'] = $log;
                    $data['erro'] = "0";
                    echo json_encode($data);
                }else{
                    echo '{"erro": "1", "stringErro": "Erro ao gerar log (venda realizada) - Código do erro: 1712"}';
                }
                $conn = null;
            }else{
                echo '{"erro": "1", "stringErro": "Código 1711 - Operação não realizada. Notificar."}';
            }
        }catch (PDOException $e){
            echo '{"erro": "1", "stringErro": "Código 1710 - '.$e->getMessage().'"}';
        }
    }else{
        echo '{"erro": "1", "stringErro": "Erro nos cálculos. Atualize a página e tente novamente - '. floatval($saldo). ' - '.floatval($valor).' = '.(floatval($saldo) - floatval($valor)).'== '.floatval($proximosaldo).'"}';
    }
});

//Requisição para recarga
$app->put('/recarga', function () {
    $app = \Slim\Slim::getInstance();
    $request = $app->request();
    $body = $request->getBody();
    $data = json_decode($body, true);
    $agora = date("Y-m-d H:i:s");
    $id = $data['id'];
    $data["valor"] = trim(str_replace(",", ".", $data["valor"]));
    $valor = $data["valor"];
    $saldo = trim(str_replace(",", ".", $data["saldo"]));
    $data["proximoSaldo"] = trim(str_replace(",", ".", $data["proximoSaldo"]));
    $proximosaldo = $data["proximoSaldo"];
    if (abs((floatval($saldo) + floatval($valor)) - floatval($proximosaldo)) < 0.001){
        try {
            $con = getConn();
            $stmt = $con->prepare("UPDATE cartoes SET saldo = ?, last = ? WHERE id = ?");
            $stmt->bindParam(1, $proximosaldo);
            $stmt->bindParam(2, $agora);
            $stmt->bindParam(3, $id);
            $execucao = $stmt->execute();
            if ($execucao){
                $con = null;
                $log = geraLog($id, $data["estacao"], $valor, $proximosaldo, '3');
                if ($log){
                    $data['lognum'] = $log;
                    $data['erro'] = "0";
                    echo json_encode($data);
                }else{
                    echo '{"erro": "1", "stringErro": "Erro ao gerar log (recarga efetuada) - Código do erro: 1713"}';
                }
                $conn = null;
            }else{
                echo '{"erro": "1", "stringErro": "Código 1717 - Operação não realizada. Notificar."}';
            }
        }catch (PDOException $e){
            echo '{"erro": "1", "stringErro": "Código 1715 - '.$e->getMessage().'"}';
        }
    }else{
        echo '{"erro": "1", "stringErro": "Erro nos cálculos. Atualize a página e tente novamente"}';
    }
});

//Requisição para finalização
$app->put('/finaliza', function () {
    $app = \Slim\Slim::getInstance();
    $request = $app->request();
    $body = $request->getBody();
    $data = json_decode($body, true);
    $agora = date("Y-m-d H:i:s");
    $id = $data['id'];
            try {
            $con = getConn();
            $stmt = $con->prepare("UPDATE cartoes SET ativo = '0', last = ? WHERE id = ?");
            $stmt->bindParam(1, $agora);
            $stmt->bindParam(2, $id);
            $execucao = $stmt->execute();
            if ($execucao){
                $con = null;
                $log = geraLog($id, $data["estacao"], $data["saldo"], $data["saldo"], '4');
                if ($log){
                    $data['lognum'] = $log;
                    $data['erro'] = "0";
                    echo json_encode($data);
                }else{
                    echo '{"erro": "1", "stringErro": "Erro ao gerar log (recarga efetuada) - Código do erro: 1705"}';
                }
                $conn = null;
            }else{
                echo '{"erro": "1", "stringErro": "Código 1718 - Operação não realizada. Notificar."}';
            }
        }catch (PDOException $e){
            echo '{"erro": "1", "stringErro": "Código 1716 - '.$e->getMessage().'"}';
        }
});


//Requisição para deletar um cartão. USO APENAS QUANDO FOR PERDIDO
$app->delete('/', function () {
    $request = \Slim\Slim::getInstance()->request();
    $pessoa = json_decode($request->getBody());
    print_r($pessoa);

});

$app->run();