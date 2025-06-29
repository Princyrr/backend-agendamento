// server.js
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

const app = express()
const port = process.env.PORT || 3000

// Conecta no MongoDB Atlas (troca a URI pela sua)
mongoose.connect('mongodb+srv://designstyler:aolrte@projeto-sobrancelha.ydopwo5.mongodb.net/agendamentos')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro MongoDB:', err))

const agendamentoSchema = new mongoose.Schema({
  nome: String,
  email: String,
  telefone: String,
  data: String,
  horario: String,
  servico: String,
  observacao: String,
})

const Agendamento = mongoose.model('Agendamento', agendamentoSchema)

app.use(cors())
app.use(express.json())

// Rota para salvar agendamento
app.post('/agendar', async (req, res) => {
  try {
    const novoAgendamento = new Agendamento(req.body)
    await novoAgendamento.save()
    res.status(201).json({ message: 'Agendamento criado com sucesso!' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar agendamento' })
  }
})

// Rota para listar agendamentos
app.get('/agendamentos', async (req, res) => {
  try {
    const agendamentos = await Agendamento.find()
    res.json(agendamentos)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos' })
  }
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
})
