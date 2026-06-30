export default function About() {
  return (
    <section className="section">
      <div className="container narrow">
        <p className="section__kicker">About</p>
        <h1 className="section__title">What is FCSA?</h1>
        <p>
          FCSA is the Forum of [full name to confirm], bringing together members and the wider industry to share
          practice, debate ideas and build the community. This app is a developing home for our public information
          and annual forum.
        </p>
        <h2>What we do</h2>
        <ul className="bullets">
          <li>Run an annual forum with talks, panels and workshops.</li>
          <li>Provide resources and guidance for members.</li>
          <li>Represent and connect the wider community.</li>
        </ul>
        <h2>Get involved</h2>
        <p>
          Find out more at <a href="https://www.fcsa.org.uk" target="_blank" rel="noreferrer">fcsa.org.uk</a>,
          or head to the forum agenda to see this year's event.
        </p>
      </div>
    </section>
  )
}