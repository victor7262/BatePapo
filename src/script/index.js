const url = "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/";

let usuario = new Object();
let mensagemPara = "Todos";
let mensagemPrivada = false;
let manterLogadoInterval;
let buscarMensagensInterval;
let horaUltimaMensagem = null;
let contadorMensagens = 0;

const inputEnter = document.getElementById("NovaMensagem");
inputEnter.addEventListener("keyup", function (e) {
	var key = e.which || e.keyCode;
	if (key == 13) EnviarMensagem(this);
});

function Entrar(nome) {
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
	//manter logado

	manterLogadoInterval = setInterval(manterLogado, 4000);
	buscarMensagensInterval = setInterval(buscarMensagem, 3000);
	document.querySelector(".tela-entrada").style.display = "none";
	document.querySelector(".main").style.display = "flex";
}

function entrarErro(res) {
	console.log("erro...");
	console.log(res);

	if (res.response.status == 400) {
		document.querySelector("#NomeEmUso").style.display = "block";
	}
}

function manterLogado() {
	const pManterLogado = axios.post(url + "status", usuario);
	pManterLogado.catch(Sair);
}

function Sair() {
	clearInterval(manterLogadoInterval);
	clearInterval(buscarMensagensInterval);

	mensagemPara = "Todos";
	mensagemPrivada = false;
	horaUltimaMensagem = null;
	contadorMensagens = 0;
	usuario = new Object();

	document.querySelector(".tela-entrada").style.display = "flex";
	document.querySelector(".main").style.display = "none";
	document.querySelector(".messages").innerHTML = "";
}

function buscarMensagem() {
	const pBuscarMensagem = axios.get(url + "messages");
	pBuscarMensagem.then(buscarMensagemSucesso);
	pBuscarMensagem.catch(Sair);
}

function buscarMensagemSucesso(res) {
	// console.log("buscar");
	// console.log(horaUltimaMensagem);
	// console.log(res);
	if (horaUltimaMensagem == null) {
		for (let index = res.data.length - 1; index >= 0; index--) {
			const mensagem = res.data[index];

			if (mensagem.from === usuario.name) {
				adicionarMensagemNaTela(mensagem);
				return;
			}
		}
	} else {
		for (let index = 0; index < res.data.length; index++) {
			const mensagem = res.data[index];
			if (mensagem.time > horaUltimaMensagem) adicionarMensagemNaTela(mensagem);
		}
	}
}

function contornarDadosDeTesteDoServidor(mensagem) {
	let dtAux = new Date(new Date().getTime() + 5 * 60000 - 9 * 60 * 60000);
	let timeAux = "";

	if (dtAux.getHours() < 10) timeAux += "0" + dtAux.getHours().toString();
	else timeAux += dtAux.getHours();

	timeAux += ":";

	if (dtAux.getMinutes() < 10) timeAux += "0" + dtAux.getMinutes().toString();
	else timeAux += dtAux.getMinutes();

	timeAux += ":";

	if (dtAux.getSeconds() < 10) timeAux += "0" + dtAux.getSeconds().toString();
	else timeAux += dtAux.getSeconds();

	return horaUltimaMensagem != null && mensagem.time > timeAux;
}

function adicionarMensagemNaTela(mensagem) {
	console.log(mensagem);

	if (contornarDadosDeTesteDoServidor(mensagem)) {
		//servidor com mensagem antiga está atrapalhando a aplicação
		//só pega mensagem nova se ela tiver no máximo 5 minutos de diferença da última
		return;
	}

	horaUltimaMensagem = mensagem.time;
	contadorMensagens++;

	let novaMensagemHtml = "";

	switch (mensagem.type) {
		case "status":
			novaMensagemHtml = `<div id="msg${contadorMensagens}" class="message message-status">
			<div class="message-content">
				<span class="message-time">(${mensagem.time}) </span
				><span class="message-from">${mensagem.from} </span
				><span class="message-text">${mensagem.text}</span>
			</div>
		</div>`;
			break;

		case "message":
			novaMensagemHtml = `<div id="msg${contadorMensagens}" class="message message-all">
			<div class="message-content">
				<span class="message-time">(${mensagem.time}) </span
				><span class="message-from">${mensagem.from} </span
				><span class="message-from-to">para </span
				><span class="message-to">${mensagem.to}: </span
				><span class="message-text">${mensagem.text}</span>
			</div>
		</div>`;
			break;

		case "private_message":
			novaMensagemHtml = `<div id="msg${contadorMensagens}" class="message message-reserv">
			<div class="message-content">
			<span class="message-time">(${mensagem.time}) </span
			><span class="message-from">${mensagem.from} </span
				><span class="message-from-to">reservadamente para </span
				><span class="message-to">${mensagem.to}: </span
				><span class="message-text">${mensagem.text}</span>
			</div>
		</div>`;
			break;
		default:
			break;
	}

	const messages = document.querySelector(".messages");
	messages.innerHTML += novaMensagemHtml;

	document.querySelector("#msg" + contadorMensagens).scrollIntoView();
}

function EnviarMensagem(msg) {
	var novaMensagem = new Object();
	novaMensagem.from = usuario.name;
	novaMensagem.to = mensagemPara;
	novaMensagem.text = msg.value;

	if (mensagemPrivada) novaMensagem.type = "private_message";
	else novaMensagem.type = "message";

	msg.value = "";

	const pEnviarMensagem = axios.post(url + "messages", novaMensagem);
	pEnviarMensagem.then(buscarMensagem);
	pEnviarMensagem.catch(Sair);
}
