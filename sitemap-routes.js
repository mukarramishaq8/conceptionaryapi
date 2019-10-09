import React from 'react';
import { Route } from 'react-router';
 
export default (
    <Route>
        <Route path='/' />
        <Route path='/Concepts/:name' />
        <Route path='/Authors/:name' />
        <Route path='/Concept-Clusters/:name' />
        <Route path='/perspective/:id' />
        <Route path='/Author-Groups/:name' />
    </Route>
);