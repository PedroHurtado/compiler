const data =  {
    value: true,
    text: 'Almo',
    active: 1,
    items: [
        { name: 'Pedro' }, { name: 'Loco' }
    ],
    click: function (value,event){
        console.log(`${this.text} está bastante cuerdo....`)
    }
};
export default data;
