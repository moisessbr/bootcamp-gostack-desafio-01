const express = require("express");

const server = express();

server.use(express.json());

var projects = [];

let requisitions = 0;

/*
Crie um middleware global chamado em todas requisições que imprime(console.log)
uma contagem de quantas requisições foram feitas na aplicação até então;
*/

server.use((req, res, next) => {
  requisitions++;
  console.log(`${requisitions} requests were made.`);
  next();
});

/*
Crie um middleware que será utilizado em todas rotas que recebem o ID
do projeto nos parâmetros da URL que verifica se o projeto com aquele
ID existe. Se não existir retorne um erro, caso contrário
permita a requisição continuar normalmente;
*/

function checkIdExists(req, res, next) {
  const { id } = req.params;
  const index = projects.findIndex(projects => projects.id == id);
  if (index == -1) {
    return res.status(404).json({ error: "id not found" });
  }
  return next();
}

//Adicionei este middleware para bloquear a criação de projetos com ids duplicadas.

function checkIdDuplicated(req, res, next) {
  const { id } = req.body;
  const index = projects.findIndex(projects => projects.id == id);
  if (index == -1) {
    return next();
  }
  return res.status(400).json({ error: "Id already in use." });
}

/*
POST /projects: A rota deve receber id e title dentro corpo e cadastrar
um novo projeto dentro de um array no seguinte formato:
{ id: "1", title: 'Novo projeto', tasks: [] };
Certifique-se de enviar tanto o ID quanto o título
do projeto no formato string com àspas duplas.
*/

server.post("/projects", checkIdDuplicated, (req, res) => {
  const { id, title } = req.body;
  if (!id || !title) {
    return res.status(400).json({ error: "Request error." });
  }
  const project = { id, title, tasks: [] };
  projects.push(project);
  return res.json(
    `O projeto id ${id} chamado ${title} foi inserido com sucesso.`
  );
});

/*
POST /projects/:id/tasks: A rota deve receber um campo title e armazenar
uma nova tarefa no array de tarefas de um projeto específico
escolhido através do id presente nos parâmetros da rota;
*/

server.post("/projects/:id/tasks", checkIdExists, (req, res) => {
  const { id } = req.params;
  const { task } = req.body;
  if (!id || !task) {
    return res.status(400).json({ error: "Request error." });
  }
  const index = projects.findIndex(projects => projects.id == id);
  projects[index].tasks.push(task);
  return res.json(projects);
});

//GET /projects: Rota que lista todos projetos e suas tarefas;

server.get("/projects", (req, res) => {
  if (projects == "") {
    return res.json("No projects registered.");
  }
  return res.json(projects);
});

//PUT /projects/:id: A rota deve alterar apenas o título do projeto com o id presente nos parâmetros da rota;

server.put("/projects/:id", checkIdExists, (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const index = projects.findIndex(projects => projects.id == id);
  projects[index].title = title;
  return res.json(projects);
});

//DELETE /projects/:id: A rota deve deletar o projeto com o id presente nos parâmetros da rota;

server.delete("/projects/:id", checkIdExists, (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Request error." });
  }
  const index = projects.findIndex(projects => projects.id == id);
  projects.splice(index, 1);
  return res.json(projects);
});

server.listen(3000);
