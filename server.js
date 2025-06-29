import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

const app = express()
const port = process.env.PORT || 3000

// Conecta ao MongoDB Atlas
mongoose.connect('mongodb+srv://designstyler:aolrte@projeto-sobrancelha.ydopwo5.mongodb.net/agendamentos?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro MongoDB:', err))

// Schema e Model
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

// Criar agendamento com validações
app.post('/agendar', async (req, res) => {
  try {
    const { data, servico } = req.body

    // Verifica se o serviço é do tipo que só pode ter 1 agendamento por dia
    const servicosUnicosPorDia = ['Design + Microblading'] // adicione outros serviços se quiser

    if (servicosUnicosPorDia.includes(servico)) {
      const existe = await Agendamento.findOne({ data, servico })
      if (existe) {
        return res.status(400).json({ error: `Já existe um agendamento para ${servico} neste dia.` })
      }
    }

    // Verifica se a data é dia de semana (segunda a sexta)
    const diaSemana = new Date(data).getDay() // 0 = domingo, 6 = sábado
    if (diaSemana === 0 || diaSemana === 6) {
      return res.status(400).json({ error: 'Agendamento não permitido para finais de semana.' })
    }

    // Se passar, cria o agendamento
    const novoAgendamento = new Agendamento(req.body)
    await novoAgendamento.save()
    res.status(201).json({ message: 'Agendamento criado com sucesso!' })

  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar agendamento' })
  }
})

// Listar agendamentos
app.get('/agendamentos', async (req, res) => {
  try {
    const agendamentos = await Agendamento.find()
    res.json(agendamentos)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos' })
  }
})

// Atualizar agendamento
app.put('/agendamentos/:id', async (req, res) => {
  try {
    const atualizado = await Agendamento.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(200).json(atualizado)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento' })
  }
})

// Deletar agendamento
app.delete('/agendamentos/:id', async (req, res) => {
  try {
    await Agendamento.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Agendamento deletado com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar agendamento' })
  }
})

// Start do servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
})
