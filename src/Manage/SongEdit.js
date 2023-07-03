import { Formik } from 'formik';
import React from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useSaveSong } from '../Queries/SongQueries';

export const SongEdit = () => {
    var initialValues = {
        id: 0,
        title: "",
        composer: "",
        lyricist: "",
        yearPublished: 0
    };
    var songMutation = useSaveSong();

    const onSubmit = (values, { setSubmitting }) => {
        songMutation.mutate(values, {
            onSettled: () => {
                setSubmitting(false);
            }
        })
            // .then((result) => {
            //     console.debug(result);
            // })
            // .finally(() => setSubmitting(false));
    };

    return (
        <Card>
            <Card.Header>Add Song</Card.Header>
            <Card.Body>
                <Formik initialValues={initialValues}
                    onSubmit={onSubmit}
                    >
                               {({
         values,
         errors,
         touched,
         handleChange,
         handleBlur,
         handleSubmit,
         isSubmitting,
         /* and other goodies */
       }) => (
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="title" className='mb-3'>
                            <Form.Label>Title</Form.Label>
                            <Form.Control placeholder='Title' name="title" onChange={handleChange} />
                        </Form.Group>
                        <Form.Group controlId="composer" className='mb-3'>
                            <Form.Label>Composer</Form.Label>
                            <Form.Control placeholder='Composer' name="composer" onChange={handleChange} />
                        </Form.Group>
                        <Form.Group controlId="lyricist" className='mb-3'>
                            <Form.Label>Lyricist</Form.Label>
                            <Form.Control placeholder='Lyricist' name="lyricist" onChange={handleChange} />
                        </Form.Group>
                        <Form.Group controlId="yearPublished" className='mb-3'>
                            <Form.Label>Year Published</Form.Label>
                            <Form.Control placeholder='Enter Year' name="yearPublished" onChange={handleChange} />
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>Submit</Button>
                    </Form>
       )}
                </Formik>
            </Card.Body>
        </Card>
    );
}