import React from 'react';
import { useParams } from 'react-router';

export const Quartet = (props) => {
    const { id } = useParams();

    return (
        <div>
            <div>
                Quartet {id}
            </div>
        </div>
    );
}