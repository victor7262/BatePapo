const url = "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/";

let usuario = new Object();
let manterLogadoInterval;

function entrar(nome) {
	document.querySelector("#NomeEmUso").style.display = "none";
	document.querySelector("#InformarNome").style.display = "none";

	if (nome.value == "") {
		document.querySelector("#InformarNome").style.display = "block";
	}

	usuario = new Object();
	usuario.name = nome.value;

	const pEntrar = axios.post(url + "participants", usuario);
	pEntrar.then(entrarSucesso);
	pEntrar.catch(entrarErro);
}

function entrarSucesso(res) {
	console.log("sucesso...");
	console.log(res);
}

function entrarErro(res) {
	console.log("erro...");
	console.log(res);

	if (res.response.status == 400) {
		document.querySelector("#NomeEmUso").style.display = "block";
	}
}

function manterLogado() {}

function sair() {}
