FROM mongo:4.2.1
COPY habits.json /habits.json
CMD mongoimport --host mongo --db felicidade --collection habits --type json --file /habits.json --jsonArray
