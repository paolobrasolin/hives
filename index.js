const mergeTimeseries = function(...series) {
  merged = [];
  series.forEach((serie, index) => {
    serie.forEach(([t, v]) => {
      merged[t] = merged[t] || new Array(series.length);
      merged[t][index] = v;
    });
  });
  return Object.keys(merged).map(k => [new Date(k * 1000), ...merged[k]]);
};

const handleDataLoaded = function(data) {
  let graphs = {};

  graphs.weight = new Dygraph(
    document.getElementById("graph_weight"),
    mergeTimeseries(
      data["total_weight"],
      data["weight1"],
      data["weight2"],
      data["weight3"],
      data["weight4"]
    ),
    {
      labels: ["t", "Total weight [kg]", "W1", "W2", "W3", "W4"]
    }
  );

  graphs.humidity = new Dygraph(
    document.getElementById("graph_humidity"),
    mergeTimeseries(data["humidity"]),
    {
      labels: ["t", "Humidity [%]"]
    }
  );

  graphs.temperature = new Dygraph(
    document.getElementById("graph_temperature"),
    mergeTimeseries(data["temperature"], data["weather_temperature"]),
    {
      labels: ["t", "Temperature [°C]", "Weather temperature [°C]"],
    }
  );

  graphs.power = new Dygraph(
    document.getElementById("graph_power"),
    mergeTimeseries(data["battery"], data["signal_strength"]),
    {
      labels: ["t", "Battery [%]", "Signal [%]"]
    }
  );

  graphs.light = new Dygraph(
    document.getElementById("graph_light"),
    mergeTimeseries(data["solar_intensity"]),
    {
      labels: ["t", "Light intensity [W/m^2]"]
    }
  );

  graphs.sound = new Dygraph(
    document.getElementById("graph_sound"),
    mergeTimeseries(data["sound_intensity"].map(([t,v])=>[t,10*Math.log10(v*10**12)])),
    {
      labels: ["t", "Sound intensity [dB]"]
    }
  );

  const sync = Dygraph.synchronize(Object.values(graphs), {
    selection: true,
    zoom: true,
    range: false
  });
};

document.addEventListener('DOMContentLoaded', ()=>{
  fetch("data.json").then(response => {
    const data = response.json();
    handleDataLoaded(data);
  });
});
