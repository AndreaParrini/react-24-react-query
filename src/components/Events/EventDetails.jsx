import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import Header from '../Header.jsx';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const params = useParams();

  const idEvent = params.id;
  const {data, isPending, isError, error} = useQuery({
    queryKey: ['event', {id: idEvent}],
    queryFn: ({signal}) => fetchEvent({id: idEvent, signal})
  })

  const {mutate,isPending:isPendingDelete, isError : isErrorDelete, error: errorDelete} = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      });
      navigate('/events');
    }
  })

  function handleStartDeleting(){
    setIsDeleting(true);
  }

  function handleStopDeleting(){
    setIsDeleting(false);
  }

  function handleDelete(){
    mutate({id: idEvent})
  }

  let content;

  if(isPending){
    content = (
      <div id='event-details-content' className='center'>
          <p>Fetching event data...</p>
          <LoadingIndicator />
      </div>
    )
  }

  if(isError){
    content = (
      <div id='event-details-content' className='center'>
        <ErrorBlock title='An error occurred' message={error.info?.message || 'Failed to fetch event'}/>
      </div>
    )
  }

  if(data){
    const formattedDate = new Date(data.date).toLocaleDateString('en-US',{
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDeleting}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    )
  }
  return (
    <>
    {isDeleting && (
      <Modal onClose={handleStopDeleting}>
        <h2>Are you sure?</h2>
        <p>Do you really ant to delet this event? This action cannot be undone!</p>
        <div className='form-actions'>
          {isPendingDelete && <LoadingIndicator />}
          {!isPendingDelete && <button onClick={handleStopDeleting} className='button-text'>Cancel</button>}
          <button onClick={handleDelete} className='button' disabled={isPendingDelete}>{isPendingDelete ? 'Submitting...' : 'Delete'}</button>
        </div>
        {isErrorDelete && <ErrorBlock title='An error occurred' message={errorDelete.info?.message}/>}
      </Modal>
    )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id='event-details'>{content}</article>
    </>
  );
}
