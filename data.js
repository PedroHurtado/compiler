const data =  {
    value: true,
    text: 'Almo',
    active: 1,
    items: [
        { name: 'Pedro' }, { name: 'Loco' }
    ],
    click: function (value,event){
        console.log(`${value} está bastante cuerdo....`)
    }
};
export default data;
