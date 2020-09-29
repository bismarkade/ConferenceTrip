window.onload = init;


function init(){
  

 
  const mapcneterCoordinate = ol.proj.fromLonLat([14.62, 47.89], 'EPSG:3857')
     // Map Controls
  const attributionControl = new ol.control.Attribution({
    collapsible: true
  })

  const scaleLineControl = new ol.control.ScaleLine({
    units: 'metric',
    minWidth: 200,
    bar: true,
    steps: 5,
    text: true
  }) 

  const overViewMapControl = new ol.control.OverviewMap({
    tipLabel: 'Custom Overview Map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ]
  })

  const zoomControl = new ol.control.Zoom()
  const mapControls = [attributionControl, scaleLineControl, overViewMapControl, zoomControl]

  //MAP 
  const map = new ol.Map({
    view: new ol.View({
            center: mapcneterCoordinate,
            zoom: 3, 
            extent:[-306287.4549,-1702643.2582, 15068815.3939, 10095030.9374],
        }),
    layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
    target: 'js-map',
    controls: ol.control.defaults({attribution: false}).extend(mapControls)
    })





    // Base Layers
  // Openstreet Map Standard
  const openstreetMapStandard = new ol.layer.Tile({
    source: new ol.source.OSM(),    
    visible: true,
    title: 'OSMStandard'        
  })
   // CartoDB BaseMap Layer
  const cartoDBBaseLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'http://{1-4}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
      attributions: '© CARTO'
    }),
    visible: false,
    title: 'CartoDarkAll'
  })


  const StamenTerrain = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
      attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
    }),
    visible: false,
    title: 'StamenTerrain'
  })

   // Tour Cities GeoJSON
 const cityLayerStyle = function(feature){
    let cityID = feature.get("ID");
    let cityIDString = cityID.toString();
    const styles = [
        new ol.style.Style({
            image : new ol.style.Circle({
                fill: new ol.style.Fill({
                    color:[77, 219, 105, 0.6]
                }),
                stroke: new ol.style.Stroke({
                    color:[6, 125, 34, 1],
                    width: 2
                }),
                radius:12
            }),
            text: new ol.style.Text({
                text: cityIDString,
                scale: 1.5,
                fill: new ol.style.Fill({
                    color: [232, 26, 26, 1]
                }),
                stroke: new ol.style.Stroke({
                    color: [232, 26, 26, 1],
                    width: 0.3
                    })  
                })
            })
        ]
     return styles
    }

    const selectStyle = function(feature){
        let cityID = feature.get("ID");
        let cityIDString = cityID.toString();
        const styles = [
            new ol.style.Style({
                image : new ol.style.Circle({
                    fill: new ol.style.Fill({
                        color:[247, 26, 10, 0.5]
                    }),
                    stroke: new ol.style.Stroke({
                        color:[6, 125, 34, 1],
                        width: 2
                    }),
                    radius:12
                }),
                text: new ol.style.Text({
                    text: cityIDString,
                    scale: 1.5,
                    fill: new ol.style.Fill({
                        color: [87, 9, 9, 1]
                    }),
                    stroke: new ol.style.Stroke({
                        color: [87, 9, 9, 1],
                        width: 0.5
                        })  
                    })
                })
            ]
         return styles
        }

  const cityLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
           // url: "./data/conferencetour.geojson"
            url: "./data/locationdata.geojson"
        }),
        visible: true,
        title: "citylayer",
        style: cityLayerStyle
    })
    map.addLayer(cityLayer);

   // Base Layer Group
   const baseLayerGroup = new ol.layer.Group({
    layers: [openstreetMapStandard, cartoDBBaseLayer, StamenTerrain, cityLayer]
  })
  map.addLayer(baseLayerGroup);

  // Layer Switcher Logic for BaseLayers
  const baseLayerElements = document.querySelectorAll('.sidebar > input[type=radio]')
  for(let baseLayerElement of baseLayerElements){
    baseLayerElement.addEventListener('change', function(){
      let baseLayerElementValue = this.value;
      baseLayerGroup.getLayers().forEach(function(element, index, array){
        let baseLayerName = element.get('title');
        element.setVisible(baseLayerName === baseLayerElementValue)
      })
    })
  }

  // Map feature click logic
  const navElements = document.querySelector(".column-navigation");
  const cityNameElement = document.getElementById("Cityname");
  const cityImageElement = document.getElementById("City_image");
  const mapView = map.getView();

  map.on("singleclick", function(evt){
      map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
          let featureName = feature.get("Cityname");
          let navElement = navElements.children.namedItem(featureName);
          mainLogic(feature, navElement )
      })
  })

  function mainLogic(feature, clickedAnchorElement){
    //Re-aasign Active class to clicked elemnent
    let currentActiveStyledElement = document.querySelector(".active");
    currentActiveStyledElement.className = currentActiveStyledElement.className.replace("active", "");
    clickedAnchorElement.className = "active";

    // Default style for all features

    let citiesFeatures = cityLayer.getSource().getFeatures();
    citiesFeatures.forEach(function(feature){
        feature.setStyle(cityLayerStyle)
    })
    //feature.setStyle(selectStyle)

    //Home Element> change contentin the menu to Home
    if (clickedAnchorElement.id === "Home"){
        mapView.animate({center: mapcneterCoordinate},{zoom: 3})
        cityNameElement.innerHTML = "Welcome to my Conference Tour!. Click cities or hover on map for more details";
        cityImageElement.setAttribute("src", "./data/City_images/olomouc.jpg");
    } 
    // Change view and content in the menu based on the feature
    else {
        feature.setStyle(selectStyle)
        let featueCoordinates = feature.get("geometry").getCoordinates();
        mapView.animate({center: featueCoordinates}, {zoom: 10});
        let featureName = feature.get("Cityname");
        let featureImage =feature.get("Cityimage");
        cityNameElement.innerHTML = "Name of the city: " + featureName
        cityImageElement.setAttribute("src", "./data/City_images/" + featureImage + ".jpg");
    }
  }

  //Navigation Button logic
  const anchorNavElements = document.querySelectorAll(".column-navigation > a");
  for (let anchorNavElement of anchorNavElements){
      anchorNavElement.addEventListener("click", function(e){
        let clickedAnchorElement =e.currentTarget;
        let clickedAnchorElementID = clickedAnchorElement.id;
        let citiesFeatures = cityLayer.getSource().getFeatures();
        citiesFeatures.forEach(function(feature){
            //console.log(feature.get("Cityname"));
            let featureCityName = feature.get("Cityname");
            //console.log(featureCityName)
            if (clickedAnchorElementID === featureCityName){
                mainLogic(feature, clickedAnchorElement);
            }
         })

         //Home navigation key
         if (clickedAnchorElementID === "Home"){
             mainLogic(undefined, clickedAnchorElement)
         }

      })
  }

}