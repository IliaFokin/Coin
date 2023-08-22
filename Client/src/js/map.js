import { el } from 'redom';
import ymaps from 'ymaps';

export async function renderMap(data) {
  const mapWrapper = el('.map-wrapper');
  const container = el('.container', 
    el('.map', [
      [
        el('h2.section__title', 'Карта банкоматов'),
        mapWrapper
      ]
    ])
  )
  ymaps.load().then(maps => {
    const map = new maps.Map(mapWrapper, {
      center: [55.753544,37.621202],
      zoom: 12,
    });
    data.forEach(point => {
      const myGeoObject = new maps.GeoObject({
        geometry: {
            type: "Point", 
            coordinates: [point.lat, point.lon] 
        }
      });
      map.geoObjects.add(myGeoObject);
    })
  })
  .catch(error => console.log('Failed to load Yandex Maps', error));
  
  return container;
}