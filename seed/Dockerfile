FROM mongo
COPY habits.json /habits.json
CMD mongoimport --host mongo --db felicidade --collection habits --type json --file /habits.json --jsonArray
