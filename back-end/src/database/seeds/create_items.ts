import Knex from 'knex';

export async function seed(knex : Knex) {
    await knex('items').insert([
        { title: 'Lâmpadas', image: 'lampadas.svg'},
        { title: 'Plhas e Baterias', image: 'baterias.svg'},
        { title: 'Pápeis e Papelão', image: 'papeis-papelao.svg'},
        { title: 'Resíduos Eletrónicos', image: 'electronicos.svg'},
        { title: 'Resíduos Organicos', image: 'organicos.svg'},
        { title: 'Óleo de Cozinha', image: 'oleo.svg'},
    ])
}