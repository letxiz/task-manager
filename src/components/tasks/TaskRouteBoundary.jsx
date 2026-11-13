import { Component } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

export default class TaskRouteBoundary extends Component {
  state = { falhou: false }

  static getDerivedStateFromError() {
    return { falhou: true }
  }

  render() {
    if (!this.state.falhou) return this.props.children
    return (
      <div role="alert" className="space-y-3 py-8">
        <p>Não foi possível abrir as tarefas. Verifique a conexão e recarregue a página para tentar novamente.</p>
        <Link to="/" className="inline-block rounded-lg px-3 py-3 font-medium text-primary underline focus-visible:outline-2 focus-visible:outline-primary">
          Voltar para o início
        </Link>
      </div>
    )
  }
}

TaskRouteBoundary.propTypes = { children: PropTypes.node.isRequired }
