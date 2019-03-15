const data =  {
    value: true,
    text: 'Almo',
    active: 1,
    items: [
        { name: 'Pedro' }, { name: 'Hurtado' }
    ],
    click: function (value,event){
        console.log(`${value} está bastante cuerdo....`)
    }
};
export default data;
