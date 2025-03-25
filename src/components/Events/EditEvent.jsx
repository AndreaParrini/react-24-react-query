import { Link, redirect, useNavigate, useNavigation, useParams, useSubmit } from 'react-router-dom';
import { /* useMutation, */ useQuery } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { queryClient, updateEvent, fetchEvent } from '../../util/http.js';

export default function EditEvent() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const {state} = useNavigation();
  const params = useParams();
  const idEvent = params.id;

  // usando il loader si potrebbe usare useLoaderData, ma conviene conitnuare ad utilizzare useQuery, in quanto usanto queryClient.fetchQuery, salva il risultato nella cache 
  // e quindi riutilizzando useQuery recupera i dati dalla cache.
  const {data, isPending, isError, error} = useQuery({
    queryKey: ['event', {id: idEvent}],
    queryFn: ({signal}) => fetchEvent({id: idEvent, signal}),
    staleTime: 10000
  })

  /* const {mutate} = useMutation({
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
  }) */

  function handleSubmit(formData) {
    /* mutate({id: idEvent, event:formData})
    navigate('../'); */
    submit(formData, {method: 'PUT'})
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
        {state === 'submitting' ? 
          (<LoadingIndicator />) 
        :
          (
          <Link to="../" className="button-text">
            Cancel
          </Link>
          )
        }
        
        <button type="submit" className="button" disabled={state === 'submitting'}>
          {state === 'submitting' ? 'Sending...' : 'Update'}
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

export function loader({params}){
  const idEvent = params.id
  return queryClient.fetchQuery({
    queryKey: ['event', {id: idEvent}],
    queryFn: ({signal}) => fetchEvent({id: idEvent, signal})
  })
}

export async function action({request, params}){
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({id: params.id, event: updatedEventData});
  await queryClient.invalidateQueries(['events']);
  return redirect('../');
}