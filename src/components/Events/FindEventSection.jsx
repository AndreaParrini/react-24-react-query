import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { fetchEvents } from '../../util/http';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock';
import EventItem from './EventItem';

export default function FindEventSection() {
  const searchElement = useRef();
  const [searchTerm, setSearchTerm] = useState('');

  const {data, isPending, isError, error} = useQuery({
    queryKey:['events', {search: searchTerm}],
    queryFn: ({signal}) => fetchEvents({signal, searchTerm})
  })

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content= <p>Please enter a search term and to find events.</p>;

  if(isPending){
    content= <LoadingIndicator />
  }

  if(isError){
    content = <ErrorBlock title='An errore occurred' message={error.info?.message || 'Failed to fetche event.'}/>
  }

  if(data?.length > 0){
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }else{
    content = <p>No event to your search</p>
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
        {content}
      </header>
    </section>
  );
}
