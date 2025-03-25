import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { queryClient, updateEvent } from '../../util/http.js';

export default function EditEvent() {
  const navigate = useNavigate();

  const params = useParams();
  const idEvent = params.id;

  const {data, isPending, isError, error} = useQuery({
    queryKey: ['event', {id: idEvent}],
    queryFn: ({signal}) => fetchEvent({id: idEvent, signal})
  })

  const {mutate} = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event;

      await queryClient.cancelQueries(['event', {id: idEvent}]);
      const previousEvent = queryClient.getQueryData(['event', {id: idEvent}]);

      queryClient.setQueryData(['event', {id: idEvent}], newEvent)

      return {previousEvent}
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(['event', {id: idEvent}], context.previousEvent)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['event', {id: idEvent}]);
    }
  })

  function handleSubmit(formData) {
    mutate({id: idEvent, event:formData})
    navigate('../');
  }

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
