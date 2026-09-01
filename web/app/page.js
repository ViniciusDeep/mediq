const audiences = [
  ['Paciente', 'Encontre especialidades, profissionais e horários disponíveis.'],
  ['Médico', 'Organize sua disponibilidade e seus locais de atendimento.'],
  ['Clínica ou hospital', 'Centralize equipes, unidades e agendas em um só lugar.']
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">MEDIQ</p>
        <h1>Sua saúde, no horário certo.</h1>
        <p className="intro">
          Uma plataforma de agendamento médico para conectar pacientes, médicos e organizações de saúde.
        </p>
        <button>Buscar consulta</button>
      </section>
      <section className="audiences" aria-label="Para quem é a Mediq">
        {audiences.map(([title, description]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
