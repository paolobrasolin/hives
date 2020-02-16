require "http"
require "nokogiri"
require "byebug"
require "json"

HOST = ENV["HOST"]
USER_EMAIL = ENV["USER_EMAIL"]
USER_PASSWORD = ENV["USER_PASSWORD"]
HIVE_ID = ENV["HIVE_ID"]

sign_in_url = "#{HOST}/users/sign_in"

print "Getting authenticity token to request login... "
response = HTTP.get(sign_in_url)
html = Nokogiri::HTML(response.to_s)
authenticity_token = html.xpath("//input[@name='authenticity_token']/@value").to_s
print "Done.\n"

print "Requesting login to get session cookie... "
form = {
  authenticity_token: authenticity_token,
  'user[email]': USER_EMAIL,
  'user[password]': USER_PASSWORD,
}

response = HTTP.post(sign_in_url, form: form)
threebee_session = response.cookies.cookies.find { |c| c.name = "_threebee_session" }.value
print "Done.\n"

datasets = {
  # bars_charts: nil, # not particularly useful
  total_weight: nil,
  weight1: nil,
  weight2: nil,
  weight3: nil,
  weight4: nil,
  humidity: nil,
  temperature: nil,
  weather_temperature: nil,
  battery: nil,
  signal_strength: nil,
  solar_intensity: nil,
  sound_intensity: nil,
}

print "Requesting datasets:\n"
datasets.keys.each do |key|
  print "  #{key}... "
  dataset_url = "#{HOST}/hives/#{HIVE_ID}/#{key}"
  response = HTTP.cookies(_threebee_session: threebee_session).get(dataset_url)
  data = JSON.parse(response.to_s)
  datasets[key] = data.fetch("hive").split(",").each_slice(2).each_with_object([]) do |(t, v), acc|
    prev_t, _ = acc.last
    acc << [(prev_t || 0) + t.to_i, v.to_f]
  end
  print "Done.\n"
end

File.open("docs/data.json", "w") do |f|
  f.write(JSON.pretty_generate(datasets))
end
