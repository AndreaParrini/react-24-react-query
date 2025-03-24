import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';

import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../../util/http.js';

export default function NewEventsSection() {
  const{data, isPending, isError, error}=useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5000, // il tempo che react query aspetterà rpima di mandare una nuova richiesta per i dati aggiornati, così aspetterà 5000 millesecondi prima di mandare la nuova richiesta, di default è 0;
    // gcTime: 1000 si intende il tempo con il quale i dati rimangono memorizzati nella cache, passato quel tempo vengo rimossi dalla cache, il tempo di default è 5 min;
  })

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock title="An error occurred" message={error.info?.message || "Failed to fetch events"} />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
