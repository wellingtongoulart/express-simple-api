import express from 'express';
import apicache from 'apicache';

const app = express();
const cache = apicache.middleware('1 hour');
const PORT = 3000;

const resultados = {
  pessoas: [{id:1, nome: "Marcelo"}, {id:2, nome: "João"}, {id:3, nome: "Maria"}],
  carros: [{id:1, modelo: "Fusca"}, {id:2, modelo: "Gol"}, {id:3, modelo: "Palio"}],
  animais: [{id:1, nome: "Cachorro"}, {id:2, nome: "Gato"}, {id:3, nome: "Papagaio"}]
}

const calculatETag = (data: any) => {
  const ETag = `api_cach_${data}`;
  return ETag;
}

app.get('/', (req, res) => {
  const keys = JSON.stringify(Object.keys(resultados));
  const list = keys.replace(/[^a-zA-Z,]/g, '');
  res.status(200).send(`Endpoints disponíveis para consulta: ${list}`);
})

app.get('/:path', cache, (req, res) => {
  const path = req.params.path as keyof typeof resultados;
  if (path in resultados) {
    const response = resultados[path];

    const currentETag = calculatETag(JSON.stringify(response));
    const requestETag = req.header('If-None-Match');
    if (requestETag == currentETag) {
      res.status(304).end();
    }

    res.set('ETag', currentETag);
    res.status(200).json(response);
  }

  res.status(400).json({error: 'Rota não encontrada.'});
});

app.get('/:path/:id', cache, (req, res) => {
  const path = req.params.path as keyof typeof resultados;
  const id = Number(req.params.id);
  const response = resultados[path].find((pessoa) => pessoa.id === id)
  if (response) {

    const currentETag = calculatETag(JSON.stringify(response));
    const requestETag = req.header('If-None-Match');
    if (requestETag == currentETag) {
      res.status(304).end();
    }

    res.set('ETag', currentETag);
    res.status(200).json(response);
  }

  res.status(400).json({error: 'Rota não encontrada.'});
});

app.listen(PORT, () => console.log('server started'));