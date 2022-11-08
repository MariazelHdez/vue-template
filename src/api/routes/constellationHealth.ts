import express, { Request, Response } from "express";
import { body, param } from "express-validator";
//import moment from "moment";
import knex from "knex";
//import { ReturnValidationErrors } from "../../middleware";
import { DB_CONFIG } from "../config";

let { RequireServerAuth, RequireAdmin } = require("../auth")

const db = knex(DB_CONFIG)

export const constellationRouter = express.Router();

constellationRouter.get("/constellationHealth",
    [param("id").notEmpty()], ReturnValidationErrors, async (req: Request, res: Response) => {
        let { id } = req.params;

        var constellationHealth =  await db("constellation_health.constellation_health")
            .leftjoin('constellation_health_language', 'constellation_health.language_prefer_to_receive_services', '=', 'constellation_health_language.id')
            .select('constellation_health.*',
                    'constellation_health_language.description as language_preferred')
            .where('constellation_health.status', 'open')
            .orderBy('constellation_health.id', 'asc');

        constellationHealth.forEach(function (value: any) {
            if(value.language_prefer_to_receive_services){
                value.language_prefer_to_receive_services = value.preferred_language;
            }else{
                value.language_prefer_to_receive_services = value.language_preferred;
            }

            if(!(value.diagnosis) && value.diagnosis.indexOf(',') !== false){
                let ids = value.diagnosis.split(",");
                let dataString = "";

                for (let i=0; i < ids.length ; i++) {
                    var info_find = await db("constellation_health.constellation_health")
                                    .where({ id: ids[i] });

                    if(!isNaN(ids[i]) && !info_find && typeof info_find.description !== 'undefined'){
                        dataString += info_find.description+",";
                    }else{
                        dataString += ids[i]+",";
                    }
                }

                if(dataString.substr(-1) == ","){
                    dataString = dataString.substr(0, -1);
                }

                value.diagnosis = dataString.replace(",",", ");

            }else if(!value.diagnosis){
                var info_find = await db("constellation_health.constellation_health_diagnosis_history").where({ id: value.diagnosis });

                if(!isNaN(value.diagnosis) && !info_find && typeof info_find.description !== 'undefined'){
                    value.diagnosis = info_find.description;
                }
            }
        });

        res.status(404).send({ data: constellationHealth });
});

constellationRouter.put("/:constellationHealth_id",
    [param("constellationHealth_id").isInt().notEmpty()], ReturnValidationErrors,
    async (req: Request, res: Response) => {
        let { constellationHealth_id } = req.params;

        var constellationHealth = await db("constellation_health.constellation_health")
            .leftjoin('constellation_health_language', 'constellation_health.language_prefer_to_receive_services', '=', 'constellation_health_language.id')
            .leftjoin('constellation_health_diagnosis_history', 'constellation_health.diagnosis', '=', 'constellation_health_diagnosis_history.id')
            .leftjoin('constellation_health_demographics', 'constellation_health.demographics_groups', '=', 'constellation_health_demographics.id')
            .select('constellation_health.*',
                    'constellation_health_language.description as language_prefer_description',
                    'constellation_health_demographics.description as demographic_description')
            .where({ id: constellationHealth_id });

        var constellationFamily = await db("constellation_health.constellation_health_family_members")
        .leftjoin('constellation_health_language', 'constellation_health_family_members.language_prefer_to_receive_services_family_member', '=', 'constellation_health_language.id')
            .leftjoin('constellation_health_diagnosis_history', 'constellation_health_family_members.diagnosis_family_member', '=', 'constellation_health_diagnosis_history.id')
            .leftjoin('constellation_health_demographics', 'constellation_health_family_members.demographics_groups_family_member', '=', 'constellation_health_demographics.id')
            .select('constellation_health_family_members.*',
                    'constellation_health_language.description as language_prefer_description_family_member',
                    'constellation_health_demographics.description as demographic_description_family_member')
            .where({ id: constellationHealth_id });

        if(constellationHealth.date_of_birth == 0) {
            constellationHealth.date_of_birth =  "N/A";
        }

        if(!(constellationHealth.diagnosis) && constellationHealth.diagnosis.indexOf(',') !== false){
            var ids = constellationHealth.diagnosis.split(",");
            let dataString = "";

            for (let i=0; i < ids.length ; i++) {
                var info_find =  await db("constellation_health.constellation_health_diagnosis_history").where({ id: ids[i] });
                if(!isNaN(ids[i]) && !(info_find) && typeof info_find.description !== 'undefined' ){
                    dataString += info_find.description+",";
                }else{
                    dataString += ids[i]+",";
                }
            }

            if(dataString.substr(-1) == ","){
                dataString = dataString.substr(0, -1);
            }

            constellationHealth.diagnosis = dataString.replace(",",", ");

        }else if(!(constellationHealth.diagnosis)){
            info_find = await db("constellation_health.constellation_health_diagnosis_history").where({ id: constellationHealth.diagnosis });

            if(!isNaN(constellationHealth.diagnosis) && !(info_find) && typeof info_find.description !== 'undefined'){
                constellationHealth.diagnosis = info_find.description;
            }
        }

        constellationHealth.flagFamilyMembers = false;

        if(constellationFamily.length){
            constellationHealth.flagFamilyMembers = true;
            constellationFamily.forEach(function (value: any) {

                if(value.date_of_birth_family_member == 0) {
                    value.date_of_birth_family_member =  "N/A";
                }

                if(!(value.diagnosis_family_member) && value.diagnosis_family_member.indexOf(',') !== false){
                    var ids = value.diagnosis_family_member.split(",");
                    var dataString = "";

                    for (let i=0; i < ids.length ; i++) {
                        var info_find =  await db("constellation_health.constellation_health_diagnosis_history").where({ id: ids[i] });
                        if(!isNaN(ids[i]) && !(info_find) && typeof info_find.description !== 'undefined'){
                            dataString += info_find.description+",";
                        }else{
                            dataString += ids[i]+",";
                        }
                    }

                    if(dataString.substr(-1) == ","){
                        dataString = dataString.substr(0, -1);
                    }

                    constellationFamily[key].diagnosis_family_member = dataString.replace(",",", ");

                }else if(!value.diagnosis_family_member){
                    info_find = await db("constellation_health.constellation_health_diagnosis_history").where({ id: value.diagnosis_family_member });

                    if(!isNaN(value.diagnosis_family_member) && !(info_find) && typeof info_find.description !== 'undefined'){
                        constellationFamily[key].diagnosis_family_member = info_find.description;
                    }
                }
            }
        }
});

function getMultipleIdsByModel(model, names) {
    var others = "";
    var auxNames = names;

    if(model == "ConstellationHealthDiagnosisHistory") {
        var diagnosisHistory = ConstellationHealthDiagnosisHistory::all()->pluck('description', 'value');

        names.forEach(function (value: any) {
            if(!isset(diagnosisHistory[value])){
                others = names[key];
                unset(names[key]);
            }
        }); 

        var data = ConstellationHealthDiagnosisHistory::whereIn('value', names)->get();
    }else if(model == "ConstellationHealthDemographics") {
        var demographics = ConstellationHealthDemographics::all()->pluck('description', 'value');

        names.forEach(function (value: any) {
            if(!isset(demographics[value])){
                others = names[key];
                unset(names[key]);
            }
        });

        var data = ConstellationHealthDemographics::whereIn('value', names)->get();
    }

    if(count(data)){
        var modelValues = "";
        var max = count(data);
        var count = 1;
        if(max == 1){
            modelValues = strval(data[0].id);
        }else{
            data.forEach(function (value: any) {
                if(count == max){
                    modelValues += strval(value.id);
                }else{
                    modelValues += strval(value.id)+",";
                }

                count++;
            });
        }

        if(others !== "") {
            return modelValues+","+others;
        }else{
            return modelValues;
        }

    }else if(!count(data) && count(auxNames) > 0){
        return auxNames[0];
    }else{
        return null;
    }
}