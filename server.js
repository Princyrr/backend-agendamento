import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

const app = express()
const port = process.env.PORT || 3000

mongoose.connect('mongodb+srv://designstyler:aolrte@projeto-sobrancelha.ydopwo5.mongodb.net/agendamentos?retryWrites=true&w=majority')
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

// Criar agendamento com regras
app.post('/agendar', async (req, res) => {
  try {
    const { nome, email, telefone, data, horario, servico, observacao } = req.body

    if (!nome || !email || !telefone || !data || !horario || !servico) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' })
    }

    // Não permitir agendamentos no fim de semana
    const diaSemana = new Date(data).getDay() // 0 = domingo, 6 = sábado
    if (diaSemana === 0 || diaSemana === 6) {
      return res.status(400).json({ error: 'Agendamento não permitido para finais de semana.' })
    }

    const agendamentosDoDia = await Agendamento.find({ data })

    // Se já houver um "Design + Microblading", bloqueia tudo
    const temMicroblading = agendamentosDoDia.some(a => a.servico === 'Design + Microblading')
    if (temMicroblading) {
      return res.status(400).json({ error: 'Já há um agendamento de Design + Microblading nesse dia. Nenhum outro agendamento permitido.' })
    }

    // Se quiser agendar "Design + Microblading", o dia precisa estar completamente livre
    if (servico === 'Design + Microblading' && agendamentosDoDia.length > 0) {
      return res.status(400).json({ error: 'Já há agendamentos nesse dia. Não é possível marcar Design + Microblading.' })
    }

    const novoAgendamento = new Agendamento({ nome, email, telefone, data, horario, servico, observacao })
    await novoAgendamento.save()
    res.status(201).json({ message: 'Agendamento criado com sucesso!' })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao criar agendamento' })
  }
})

// Listar todos
app.get('/agendamentos', async (req, res) => {
  try {
    const agendamentos = await Agendamento.find()
    res.json(agendamentos)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos' })
  }
})

// Atualizar
app.put('/agendamentos/:id', async (req, res) => {
  try {
    const atualizado = await Agendamento.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(200).json(atualizado)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento' })
  }
})

// Deletar
app.delete('/agendamentos/:id', async (req, res) => {
  try {
    await Agendamento.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Agendamento deletado com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar agendamento' })
  }
})

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
})
