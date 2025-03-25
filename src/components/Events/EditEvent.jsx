import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();

  const params = useParams();
  const idEvent = params.id;

  const {data, isPending, isError, error} = useQuery({
    queryKey: ['event', {id: idEvent}],
    queryFn: ({signal}) => fetchEvent({id: idEvent, signal})
  })

  function handleSubmit(formData) {}

  function handleClose() {
    navigate('../');
  }

  let content;

  if(isPending){
    content = (
      <div className='center'>
        <LoadingIndicator />
      </div>
    )
  }

  if(isError){
    content= (
      <div>
        <ErrorBlock title='An error occurred' message={error.info?.message || 'Impossible edit event in this moment. Please try again.'} />
        <Link to='/events' className='button'>
          Okay
        </Link>
      </div>
    )
  }

  if(data){
    content=(
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    )
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
